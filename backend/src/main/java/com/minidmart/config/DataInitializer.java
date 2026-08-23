package com.minidmart.config;

import com.minidmart.entity.*;
import com.minidmart.enums.*;
import com.minidmart.repository.*;
import com.minidmart.service.PickupSlotService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final CartRepository cartRepository;
    private final OrderRepository orderRepository;
    private final ReturnExchangeRequestRepository returnRepository;
    private final PickupSlotService pickupSlotService;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogRepository auditLogRepository;

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("Database already initialized with seed data.");
            return;
        }

        log.info("Starting Mini D-Mart Database Seeding...");

        // 1. Create Default Users
        User admin = User.builder()
                .name("Mini D-Mart Admin")
                .email("admin@minidmart.com")
                .password(passwordEncoder.encode("Admin@123"))
                .role(Role.ADMIN)
                .phone("+91 9552145895")
                .address("PCMC Pune")
                .active(true)
                .build();
        userRepository.save(admin);

        User manager = User.builder()
                .name("Store Operations Manager")
                .email("manager@minidmart.com")
                .password(passwordEncoder.encode("Manager@123"))
                .role(Role.MANAGER)
                .phone("+91 9876543211")
                .address("Store Branch #104, Pune")
                .active(true)
                .build();
        userRepository.save(manager);

        User staff = User.builder()
                .name("Fulfillment Staff Member")
                .email("staff@minidmart.com")
                .password(passwordEncoder.encode("Staff@123"))
                .role(Role.STAFF)
                .phone("+91 9876543212")
                .address("Store Branch #104, Pune")
                .active(true)
                .build();
        userRepository.save(staff);

        User customer = User.builder()
                .name("Mini D-Mart Customer")
                .email("customer@minidmart.com")
                .password(passwordEncoder.encode("Customer@123"))
                .role(Role.CUSTOMER)
                .phone("+91 9876543213")
                .address("Flat 402, Green Meadows Residency, Pune")
                .active(true)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        userRepository.save(customer);

        // Initialize empty cart for customer
        cartRepository.save(Cart.builder().user(customer).build());

        // 2. Create Categories
        Category catFruitsVeg = categoryRepository.save(Category.builder()
                .name("Fruits & Vegetables")
                .description("Farm-fresh crisp vegetables, seasonal fruits, and organic farm produce.")
                .imageUrl("https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=600&auto=format&fit=crop&q=80")
                .active(true)
                .build());

        Category catDairyBakery = categoryRepository.save(Category.builder()
                .name("Dairy & Bakery")
                .description("Fresh cow milk, artisan bread, paneer, butter, curd, and bakery treats.")
                .imageUrl("https://images.unsplash.com/photo-1528732263440-4dd1a18a4cc2?w=600&auto=format&fit=crop&q=80")
                .active(true)
                .build());

        Category catSnacks = categoryRepository.save(Category.builder()
                .name("Snacks & Beverages")
                .description("Crunchy namkeen, energy juices, tea, roasted coffee, biscuits, and chocolates.")
                .imageUrl("https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=600&auto=format&fit=crop&q=80")
                .active(true)
                .build());

        Category catHousehold = categoryRepository.save(Category.builder()
                .name("Household Essentials")
                .description("Cleaning detergents, dishwash gels, paper towels, and home hygiene supplies.")
                .imageUrl("https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=600&auto=format&fit=crop&q=80")
                .active(true)
                .build());

        // 3. Create 25+ Realistic Products
        List<Product> products = new ArrayList<>();

        // Fruits & Veg
        products.add(Product.builder()
                .name("Fresh Shimla Apples")
                .description("Crisp, sweet, and juicy handpicked red apples straight from Shimla orchards.")
                .price(BigDecimal.valueOf(180.00))
                .discountPrice(BigDecimal.valueOf(149.00))
                .category(catFruitsVeg)
                .imageUrl("https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600&auto=format&fit=crop&q=80")
                .stockQuantity(45)
                .lowStockThreshold(10)
                .unit("1 kg")
                .active(true)
                .build());

        products.add(Product.builder()
                .name("Robusta Bananas")
                .description("Naturally ripened sweet bananas rich in potassium and instant energy.")
                .price(BigDecimal.valueOf(60.00))
                .discountPrice(BigDecimal.valueOf(45.00))
                .category(catFruitsVeg)
                .imageUrl("https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&auto=format&fit=crop&q=80")
                .stockQuantity(30)
                .lowStockThreshold(8)
                .unit("1 dozen (12 pcs)")
                .active(true)
                .build());

        products.add(Product.builder()
                .name("Farm Fresh Hybrid Tomatoes")
                .description("Plump, firm, and vibrant red tomatoes suitable for curries and fresh salads.")
                .price(BigDecimal.valueOf(40.00))
                .discountPrice(BigDecimal.valueOf(28.00))
                .category(catFruitsVeg)
                .imageUrl("https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80")
                .stockQuantity(50)
                .lowStockThreshold(12)
                .unit("1 kg")
                .active(true)
                .build());

        products.add(Product.builder()
                .name("Premium Red Onions")
                .description("Dry, pungent, and sharp flavor red onions, a pantry staple.")
                .price(BigDecimal.valueOf(50.00))
                .discountPrice(BigDecimal.valueOf(38.00))
                .category(catFruitsVeg)
                .imageUrl("https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&auto=format&fit=crop&q=80")
                .stockQuantity(3) // LOW STOCK TEST CASE
                .lowStockThreshold(10)
                .unit("1 kg")
                .active(true)
                .build());

        products.add(Product.builder()
                .name("Fresh Baby Spinach (Palak)")
                .description("Tender, washed green spinach leaves rich in iron and dietary fiber.")
                .price(BigDecimal.valueOf(35.00))
                .discountPrice(BigDecimal.valueOf(25.00))
                .category(catFruitsVeg)
                .imageUrl("https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&auto=format&fit=crop&q=80")
                .stockQuantity(25)
                .lowStockThreshold(6)
                .unit("250 g bunch")
                .active(true)
                .build());

        products.add(Product.builder()
                .name("Green Bell Peppers (Capsicum)")
                .description("Crisp, mild, and flavorful green bell peppers for stir fries and pizzas.")
                .price(BigDecimal.valueOf(70.00))
                .discountPrice(BigDecimal.valueOf(55.00))
                .category(catFruitsVeg)
                .imageUrl("https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=600&auto=format&fit=crop&q=80")
                .stockQuantity(0) // OUT OF STOCK TEST CASE
                .lowStockThreshold(5)
                .unit("500 g")
                .active(true)
                .build());

        products.add(Product.builder()
                .name("Nagpur Fresh Oranges")
                .description("Juicy, sweet and tangy Nagpur oranges loaded with Vitamin C.")
                .price(BigDecimal.valueOf(120.00))
                .discountPrice(BigDecimal.valueOf(99.00))
                .category(catFruitsVeg)
                .imageUrl("https://images.unsplash.com/photo-1547514701-42782101795e?w=600&auto=format&fit=crop&q=80")
                .stockQuantity(18)
                .lowStockThreshold(5)
                .unit("1 kg")
                .active(true)
                .build());

        // Dairy & Bakery
        products.add(Product.builder()
                .name("Amul Taaza Homogenised Toned Milk")
                .description("Pure, hygienic, long life toned milk without preservatives.")
                .price(BigDecimal.valueOf(72.00))
                .discountPrice(BigDecimal.valueOf(68.00))
                .category(catDairyBakery)
                .imageUrl("https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&auto=format&fit=crop&q=80")
                .stockQuantity(60)
                .lowStockThreshold(15)
                .unit("1 L Tetrapack")
                .active(true)
                .build());

        products.add(Product.builder()
                .name("Amul Salted Butter")
                .description("Deliciously rich, iconic creamy salted table butter.")
                .price(BigDecimal.valueOf(275.00))
                .discountPrice(BigDecimal.valueOf(255.00))
                .category(catDairyBakery)
                .imageUrl("https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=600&auto=format&fit=crop&q=80")
                .stockQuantity(40)
                .lowStockThreshold(10)
                .unit("500 g pack")
                .active(true)
                .build());

        products.add(Product.builder()
                .name("Fresh Malai Paneer")
                .description("Soft, succulent, and protein-dense fresh cottage cheese cubes.")
                .price(BigDecimal.valueOf(110.00))
                .discountPrice(BigDecimal.valueOf(95.00))
                .category(catDairyBakery)
                .imageUrl("https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&auto=format&fit=crop&q=80")
                .stockQuantity(4) // LOW STOCK TEST CASE
                .lowStockThreshold(8)
                .unit("200 g pack")
                .active(true)
                .build());

        products.add(Product.builder()
                .name("100% Whole Wheat Brown Bread")
                .description("Nutritious, high-fiber, freshly baked artisanal brown bread.")
                .price(BigDecimal.valueOf(55.00))
                .discountPrice(BigDecimal.valueOf(48.00))
                .category(catDairyBakery)
                .imageUrl("https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80")
                .stockQuantity(22)
                .lowStockThreshold(6)
                .unit("400 g loaf")
                .active(true)
                .build());

        products.add(Product.builder()
                .name("Nestle A+ Probiotic Dahi")
                .description("Thick, creamy curd packed with gut-friendly probiotics.")
                .price(BigDecimal.valueOf(45.00))
                .discountPrice(BigDecimal.valueOf(40.00))
                .category(catDairyBakery)
                .imageUrl("https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&auto=format&fit=crop&q=80")
                .stockQuantity(35)
                .lowStockThreshold(8)
                .unit("400 g tub")
                .active(true)
                .build());

        products.add(Product.builder()
                .name("Farm Fresh Brown Eggs (Pack of 6)")
                .description("Organic grain-fed hen eggs rich in protein, lutein, and Omega-3.")
                .price(BigDecimal.valueOf(90.00))
                .discountPrice(BigDecimal.valueOf(75.00))
                .category(catDairyBakery)
                .imageUrl("https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=600&auto=format&fit=crop&q=80")
                .stockQuantity(50)
                .lowStockThreshold(10)
                .unit("6 pcs pack")
                .active(true)
                .build());

        // Snacks & Beverages
        products.add(Product.builder()
                .name("Tata Tea Gold Premium Blend")
                .description("Finest CTC tea leaves mixed with gentle aromatic long leaves.")
                .price(BigDecimal.valueOf(320.00))
                .discountPrice(BigDecimal.valueOf(289.00))
                .category(catSnacks)
                .imageUrl("https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80")
                .stockQuantity(28)
                .lowStockThreshold(6)
                .unit("500 g pouch")
                .active(true)
                .build());

        products.add(Product.builder()
                .name("Nescafe Classic Instant Coffee")
                .description("100% pure Robusta coffee beans crafted into rich aromatic granules.")
                .price(BigDecimal.valueOf(210.00))
                .discountPrice(BigDecimal.valueOf(185.00))
                .category(catSnacks)
                .imageUrl("https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80")
                .stockQuantity(30)
                .lowStockThreshold(8)
                .unit("100 g glass jar")
                .active(true)
                .build());

        products.add(Product.builder()
                .name("Haldiram's Bhujia Sev")
                .description("Authentic spicy crunchy moth bean and gram flour savory snack.")
                .price(BigDecimal.valueOf(125.00))
                .discountPrice(BigDecimal.valueOf(110.00))
                .category(catSnacks)
                .imageUrl("https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=600&auto=format&fit=crop&q=80")
                .stockQuantity(40)
                .lowStockThreshold(10)
                .unit("400 g pack")
                .active(true)
                .build());

        products.add(Product.builder()
                .name("Raw Pressery Valencia Orange Juice")
                .description("100% cold pressed valencia orange juice with no added sugar.")
                .price(BigDecimal.valueOf(150.00))
                .discountPrice(BigDecimal.valueOf(129.00))
                .category(catSnacks)
                .imageUrl("https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=600&auto=format&fit=crop&q=80")
                .stockQuantity(2) // LOW STOCK TEST CASE
                .lowStockThreshold(5)
                .unit("1 L bottle")
                .active(true)
                .build());

        products.add(Product.builder()
                .name("Oreo Vanilla Creme Biscuits Family Pack")
                .description("Crunchy chocolate cookies sandwiching velvety vanilla sweet cream.")
                .price(BigDecimal.valueOf(95.00))
                .discountPrice(BigDecimal.valueOf(79.00))
                .category(catSnacks)
                .imageUrl("https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=600&auto=format&fit=crop&q=80")
                .stockQuantity(45)
                .lowStockThreshold(10)
                .unit("300 g pack")
                .active(true)
                .build());

        products.add(Product.builder()
                .name("Cadbury Dairy Milk Silk Chocolate")
                .description("Smoother, creamier, and finer melt-in-mouth milk chocolate.")
                .price(BigDecimal.valueOf(190.00))
                .discountPrice(BigDecimal.valueOf(165.00))
                .category(catSnacks)
                .imageUrl("https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=600&auto=format&fit=crop&q=80")
                .stockQuantity(50)
                .lowStockThreshold(12)
                .unit("150 g bar")
                .active(true)
                .build());

        // Household Essentials
        products.add(Product.builder()
                .name("Surf Excel Matic Top Load Liquid Detergent")
                .description("Superior stain removal in washing machines with 100% stain elimination.")
                .price(BigDecimal.valueOf(440.00))
                .discountPrice(BigDecimal.valueOf(385.00))
                .category(catHousehold)
                .imageUrl("https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=600&auto=format&fit=crop&q=80")
                .stockQuantity(20)
                .lowStockThreshold(5)
                .unit("2 L bottle")
                .active(true)
                .build());

        products.add(Product.builder()
                .name("Vim Lemon Dishwash Gel")
                .description("Power of 100 lemons removing tough burnt grease instantly.")
                .price(BigDecimal.valueOf(135.00))
                .discountPrice(BigDecimal.valueOf(115.00))
                .category(catHousehold)
                .imageUrl("https://images.unsplash.com/photo-1585837575652-267c041d77d4?w=600&auto=format&fit=crop&q=80")
                .stockQuantity(35)
                .lowStockThreshold(8)
                .unit("750 ml bottle")
                .active(true)
                .build());

        products.add(Product.builder()
                .name("Dettol Antiseptic Liquid")
                .description("Trusted multi-purpose first aid and household germ protection.")
                .price(BigDecimal.valueOf(225.00))
                .discountPrice(BigDecimal.valueOf(199.00))
                .category(catHousehold)
                .imageUrl("https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80")
                .stockQuantity(30)
                .lowStockThreshold(6)
                .unit("500 ml bottle")
                .active(true)
                .build());

        products.add(Product.builder()
                .name("Origami 2-Ply Kitchen Paper Towels")
                .description("Super absorbent, food-safe embossed virgin paper roll.")
                .price(BigDecimal.valueOf(160.00))
                .discountPrice(BigDecimal.valueOf(130.00))
                .category(catHousehold)
                .imageUrl("https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=600&auto=format&fit=crop&q=80")
                .stockQuantity(25)
                .lowStockThreshold(5)
                .unit("2 rolls pack")
                .active(true)
                .build());

        products.add(Product.builder()
                .name("Lizol Pine Floor Cleaner Disinfectant")
                .description("Kills 99.9% germs, leaves long-lasting pleasant pine fragrance.")
                .price(BigDecimal.valueOf(195.00))
                .discountPrice(BigDecimal.valueOf(175.00))
                .category(catHousehold)
                .imageUrl("https://images.unsplash.com/photo-1585837575652-267c041d77d4?w=600&auto=format&fit=crop&q=80")
                .stockQuantity(28)
                .lowStockThreshold(6)
                .unit("1 L bottle")
                .active(true)
                .build());

        List<Product> savedProducts = productRepository.saveAll(products);

        // 4. Initialize Pickup Slots for today and upcoming 5 days
        pickupSlotService.getUpcomingSlots(5);

        // 5. Create Realistic Seed Orders for Demonstration
        Product apple = savedProducts.get(0);
        Product taazaMilk = savedProducts.get(7);
        Product butter = savedProducts.get(8);
        Product bread = savedProducts.get(10);
        Product tea = savedProducts.get(13);

        // Order 1: Delivered (for return demo)
        Order deliveredOrder = Order.builder()
                .orderNumber("ORD-2026-DELIV1")
                .user(customer)
                .subtotal(BigDecimal.valueOf(543.00))
                .discount(BigDecimal.valueOf(65.00))
                .deliveryFee(BigDecimal.ZERO)
                .totalAmount(BigDecimal.valueOf(543.00))
                .orderType(OrderType.HOME_DELIVERY)
                .deliveryAddress(customer.getAddress())
                .contactPhone(customer.getPhone())
                .status(OrderStatus.DELIVERED)
                .paymentMethod(PaymentMethod.DEMO_ONLINE_PAYMENT)
                .paymentStatus(PaymentStatus.PAID)
                .deliveredAt(LocalDateTime.now().minusDays(2))
                .createdAt(LocalDateTime.now().minusDays(3))
                .build();

        OrderItem item1 = OrderItem.builder()
                .order(deliveredOrder)
                .product(apple)
                .productName(apple.getName())
                .productUnit(apple.getUnit())
                .productImageUrl(apple.getImageUrl())
                .unitPrice(apple.getEffectivePrice())
                .quantity(2)
                .totalPrice(apple.getEffectivePrice().multiply(BigDecimal.valueOf(2)))
                .returned(false)
                .build();

        OrderItem item2 = OrderItem.builder()
                .order(deliveredOrder)
                .product(butter)
                .productName(butter.getName())
                .productUnit(butter.getUnit())
                .productImageUrl(butter.getImageUrl())
                .unitPrice(butter.getEffectivePrice())
                .quantity(1)
                .totalPrice(butter.getEffectivePrice())
                .returned(false)
                .build();

        deliveredOrder.setItems(List.of(item1, item2));
        orderRepository.save(deliveredOrder);

        // Order 2: Placed Store Pickup (for fulfillment demo)
        Order placedOrder = Order.builder()
                .orderNumber("ORD-2026-PICKUP1")
                .user(customer)
                .subtotal(BigDecimal.valueOf(357.00))
                .discount(BigDecimal.valueOf(42.00))
                .deliveryFee(BigDecimal.ZERO)
                .totalAmount(BigDecimal.valueOf(357.00))
                .orderType(OrderType.STORE_PICKUP)
                .scheduledDate(LocalDate.now())
                .scheduledTimeSlot("16:00 - 17:00")
                .contactPhone(customer.getPhone())
                .status(OrderStatus.PLACED)
                .paymentMethod(PaymentMethod.CASH_ON_DELIVERY)
                .paymentStatus(PaymentStatus.PENDING)
                .createdAt(LocalDateTime.now().minusHours(2))
                .build();

        OrderItem item3 = OrderItem.builder()
                .order(placedOrder)
                .product(taazaMilk)
                .productName(taazaMilk.getName())
                .productUnit(taazaMilk.getUnit())
                .productImageUrl(taazaMilk.getImageUrl())
                .unitPrice(taazaMilk.getEffectivePrice())
                .quantity(1)
                .totalPrice(taazaMilk.getEffectivePrice())
                .returned(false)
                .build();

        OrderItem item4 = OrderItem.builder()
                .order(placedOrder)
                .product(tea)
                .productName(tea.getName())
                .productUnit(tea.getUnit())
                .productImageUrl(tea.getImageUrl())
                .unitPrice(tea.getEffectivePrice())
                .quantity(1)
                .totalPrice(tea.getEffectivePrice())
                .returned(false)
                .build();

        placedOrder.setItems(List.of(item3, item4));
        orderRepository.save(placedOrder);

        // 6. Create a Sample Return Request for Demonstrating Return Workflows
        ReturnExchangeRequest sampleReturn = ReturnExchangeRequest.builder()
                .requestNumber("RET-2026-DEMO01")
                .order(deliveredOrder)
                .orderItem(item1)
                .user(customer)
                .requestType(RequestType.RETURN)
                .reason(ReturnReason.QUALITY_ISSUE)
                .reasonDetails("Apples were slightly bruised during transit.")
                .status(ReturnStatus.REQUESTED)
                .build();
        returnRepository.save(sampleReturn);

        // 7. Initial Audit Log
        auditLogRepository.save(AuditLog.builder()
                .userEmail("system@minidmart.com")
                .action(AuditAction.PRODUCT_CREATE)
                .entityType("SYSTEM")
                .entityId("INIT")
                .description("Mini D-Mart catalog and role data initialized successfully")
                .ipAddress("127.0.0.1")
                .build());

        log.info("Mini D-Mart Database Seeding completed successfully!");
    }
}
