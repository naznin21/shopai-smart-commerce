package com.minidmart.service;

import com.minidmart.dto.AddToCartRequest;
import com.minidmart.dto.CartDto;
import com.minidmart.dto.CartItemDto;
import com.minidmart.entity.Cart;
import com.minidmart.entity.CartItem;
import com.minidmart.entity.Product;
import com.minidmart.entity.User;
import com.minidmart.exception.BadRequestException;
import com.minidmart.exception.ResourceNotFoundException;
import com.minidmart.repository.CartRepository;
import com.minidmart.repository.ProductRepository;
import com.minidmart.repository.UserRepository;
import com.minidmart.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Value("${app.delivery.free-threshold:500.0}")
    private BigDecimal freeDeliveryThreshold;

    @Value("${app.delivery.standard-fee:40.0}")
    private BigDecimal standardDeliveryFee;

    public Cart getOrCreateCartForUser(String email) {
        return cartRepository.findByUser_Email(email).orElseGet(() -> {
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
            Cart newCart = Cart.builder()
                    .user(user)
                    .items(new ArrayList<>())
                    .build();
            return cartRepository.save(newCart);
        });
    }

    public CartDto getCartDtoForCurrentUser() {
        String email = SecurityUtils.getCurrentUserEmail();
        Cart cart = getOrCreateCartForUser(email);
        return calculateCart(cart);
    }

    public CartDto addToCart(AddToCartRequest request) {
        String email = SecurityUtils.getCurrentUserEmail();
        Cart cart = getOrCreateCartForUser(email);

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + request.getProductId()));

        if (!product.isActive()) {
            throw new BadRequestException("This product is currently not available for purchase.");
        }

        if (product.getStockQuantity() <= 0) {
            throw new BadRequestException("Sorry, '" + product.getName() + "' is out of stock.");
        }

        if (cart.getItems() == null) {
            cart.setItems(new ArrayList<>());
        }

        Optional<CartItem> existingItemOpt = cart.getItems().stream()
                .filter(item -> item.getProduct() != null && item.getProduct().getId().equals(product.getId()))
                .findFirst();

        int targetQuantity = request.getQuantity();
        if (existingItemOpt.isPresent()) {
            targetQuantity += existingItemOpt.get().getQuantity();
        }

        if (targetQuantity > product.getStockQuantity()) {
            throw new BadRequestException(String.format("Cannot add %d units. Only %d units of '%s' are available in stock.",
                    request.getQuantity(), product.getStockQuantity(), product.getName()));
        }

        if (existingItemOpt.isPresent()) {
            CartItem item = existingItemOpt.get();
            item.setQuantity(targetQuantity);
            item.setUnitPrice(product.getEffectivePrice());
            item.setProduct(product);
        } else {
            CartItem newItem = CartItem.builder()
                    .id(UUID.randomUUID().toString())
                    .product(product)
                    .quantity(request.getQuantity())
                    .unitPrice(product.getEffectivePrice())
                    .build();
            cart.getItems().add(newItem);
        }

        Cart updatedCart = cartRepository.save(cart);
        return calculateCart(updatedCart);
    }

    public CartDto updateCartItemQuantity(String cartItemId, int quantity) {
        String email = SecurityUtils.getCurrentUserEmail();
        Cart cart = getOrCreateCartForUser(email);

        if (cart.getItems() == null) {
            cart.setItems(new ArrayList<>());
        }

        Optional<CartItem> itemOpt = cart.getItems().stream()
                .filter(i -> cartItemId != null && cartItemId.equals(i.getId()))
                .findFirst();

        if (itemOpt.isEmpty()) {
            throw new ResourceNotFoundException("Cart item not found in your cart");
        }

        CartItem item = itemOpt.get();

        if (quantity <= 0) {
            cart.getItems().remove(item);
        } else {
            Product product = productRepository.findById(item.getProduct().getId())
                    .orElse(item.getProduct());

            if (quantity > product.getStockQuantity()) {
                throw new BadRequestException(String.format("Only %d units of '%s' are available in stock.",
                        product.getStockQuantity(), product.getName()));
            }
            item.setQuantity(quantity);
            item.setUnitPrice(product.getEffectivePrice());
            item.setProduct(product);
        }

        Cart updatedCart = cartRepository.save(cart);
        return calculateCart(updatedCart);
    }

    public CartDto removeCartItem(String cartItemId) {
        return updateCartItemQuantity(cartItemId, 0);
    }

    public void clearCartForUser(Cart cart) {
        if (cart.getItems() != null) {
            cart.getItems().clear();
        }
        cartRepository.save(cart);
    }

    public CartDto calculateCart(Cart cart) {
        List<CartItemDto> itemDtos = new ArrayList<>();
        BigDecimal originalSubtotal = BigDecimal.ZERO;
        BigDecimal discountedSubtotal = BigDecimal.ZERO;
        int totalQuantity = 0;

        if (cart.getItems() != null) {
            for (CartItem item : cart.getItems()) {
                Product p = item.getProduct();
                if (p == null) continue;

                BigDecimal originalUnitPrice = p.getPrice() != null ? p.getPrice() : BigDecimal.ZERO;
                BigDecimal effectiveUnitPrice = p.getEffectivePrice() != null ? p.getEffectivePrice() : originalUnitPrice;
                int qty = item.getQuantity() != null ? item.getQuantity() : 1;

                boolean isAvailable = p.isActive() && p.getStockQuantity() >= qty;
                BigDecimal itemTotal = effectiveUnitPrice.multiply(BigDecimal.valueOf(qty));
                BigDecimal originalItemTotal = originalUnitPrice.multiply(BigDecimal.valueOf(qty));

                originalSubtotal = originalSubtotal.add(originalItemTotal);
                discountedSubtotal = discountedSubtotal.add(itemTotal);
                totalQuantity += qty;

                CartItemDto itemDto = CartItemDto.builder()
                        .id(item.getId())
                        .productId(p.getId())
                        .productName(p.getName())
                        .productUnit(p.getUnit())
                        .productImageUrl(p.getImageUrl())
                        .unitPrice(effectiveUnitPrice)
                        .originalPrice(originalUnitPrice)
                        .quantity(qty)
                        .availableStock(p.getStockQuantity())
                        .itemTotal(itemTotal)
                        .isAvailable(isAvailable)
                        .build();

                itemDtos.add(itemDto);
            }
        }

        BigDecimal totalSavings = originalSubtotal.subtract(discountedSubtotal);
        if (totalSavings.compareTo(BigDecimal.ZERO) < 0) {
            totalSavings = BigDecimal.ZERO;
        }

        boolean freeDeliveryUnlocked = discountedSubtotal.compareTo(freeDeliveryThreshold) >= 0;
        BigDecimal deliveryFee = BigDecimal.ZERO;
        BigDecimal amountNeededForFree = BigDecimal.ZERO;

        if (totalQuantity > 0) {
            if (freeDeliveryUnlocked) {
                deliveryFee = BigDecimal.ZERO;
            } else {
                deliveryFee = standardDeliveryFee;
                amountNeededForFree = freeDeliveryThreshold.subtract(discountedSubtotal);
            }
        }

        BigDecimal finalTotal = discountedSubtotal.add(deliveryFee);

        return CartDto.builder()
                .id(cart.getId())
                .items(itemDtos)
                .totalQuantity(totalQuantity)
                .originalSubtotal(originalSubtotal)
                .subtotal(discountedSubtotal)
                .totalSavings(totalSavings)
                .standardDeliveryFee(standardDeliveryFee)
                .deliveryFee(deliveryFee)
                .freeDeliveryThreshold(freeDeliveryThreshold)
                .freeDeliveryUnlocked(freeDeliveryUnlocked)
                .amountNeededForFreeDelivery(amountNeededForFree)
                .finalTotal(finalTotal)
                .build();
    }
}
