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

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

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
    private final org.springframework.data.mongodb.core.MongoTemplate mongoTemplate;

    @Override
    public void run(String... args) {
        try {
            log.info("Cleaning up legacy MongoDB collection indexes...");
            mongoTemplate.indexOps(Cart.class).dropAllIndexes();
            mongoTemplate.indexOps(Product.class).dropAllIndexes();
            mongoTemplate.indexOps(Order.class).dropAllIndexes();
            mongoTemplate.indexOps(Category.class).dropAllIndexes();
            mongoTemplate.indexOps(ReturnExchangeRequest.class).dropAllIndexes();
        } catch (Exception e) {
            log.warn("Could not drop collection indexes: {}", e.getMessage());
        }

        if (productRepository.count() >= 50 && categoryRepository.count() > 0) {
            log.info("ShopAI MongoDB already initialized with seed products.");
            return;
        }

        log.info("Starting ShopAI MongoDB Database Seeding...");

        // 1. Create Default Users if none exist
        User customer = userRepository.findByEmail("customer@minidmart.com").orElse(null);
        if (userRepository.count() == 0 || customer == null) {
            User admin = User.builder()
                    .name("ShopAI Admin")
                    .email("admin@minidmart.com")
                    .password(passwordEncoder.encode("Admin@123"))
                    .role(Role.ADMIN)
                    .phone("+91 9552145895")
                    .address("ShopAI HQ, Silicon Park, Pune")
                    .active(true)
                    .build();
            userRepository.save(admin);

            User manager = User.builder()
                    .name("Store Operations Manager")
                    .email("manager@minidmart.com")
                    .password(passwordEncoder.encode("Manager@123"))
                    .role(Role.MANAGER)
                    .phone("+91 9876543211")
                    .address("ShopAI Hub #104, Pune")
                    .active(true)
                    .build();
            userRepository.save(manager);

            User staff = User.builder()
                    .name("Fulfillment Staff Member")
                    .email("staff@minidmart.com")
                    .password(passwordEncoder.encode("Staff@123"))
                    .role(Role.STAFF)
                    .phone("+91 9876543212")
                    .address("ShopAI Fulfillment Station, Pune")
                    .active(true)
                    .build();
            userRepository.save(staff);

            customer = User.builder()
                    .name("ShopAI Preferred Customer")
                    .email("customer@minidmart.com")
                    .password(passwordEncoder.encode("Customer@123"))
                    .role(Role.CUSTOMER)
                    .phone("+91 9876543213")
                    .address("Flat 402, Green Meadows Residency, Pune")
                    .active(true)
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();

            customer = userRepository.save(customer);

            // Initialize empty cart for customer
            cartRepository.save(Cart.builder().user(customer).items(new ArrayList<>()).build());
        }

        // 2. Create Categories
        categoryRepository.deleteAll();
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

        Category catStaples = categoryRepository.save(Category.builder()
                .name("Staples & Atta")
                .description("Wholesome chakki atta, premium basmati rice, organic pulses, cooking oils, and spices.")
                .imageUrl("https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80")
                .active(true)
                .build());

        // 3. Create 65+ Realistic Products Across All Categories
        List<Product> products = new ArrayList<>();

        // === 1. FRUITS & VEGETABLES (15 Products) ===
        products.add(p("Fresh Shimla Apples", "Crisp, sweet, and juicy handpicked red apples straight from Shimla orchards.", 180.00, 149.00, catFruitsVeg, "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600&auto=format&fit=crop&q=80", 45, 10, "1 kg"));
        products.add(p("Robusta Bananas", "Naturally ripened sweet bananas rich in potassium and instant energy.", 60.00, 45.00, catFruitsVeg, "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&auto=format&fit=crop&q=80", 30, 8, "1 dozen (12 pcs)"));
        products.add(p("Farm Fresh Hybrid Tomatoes", "Plump, firm, and vibrant red tomatoes suitable for curries and fresh salads.", 40.00, 28.00, catFruitsVeg, "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80", 50, 12, "1 kg"));
        products.add(p("Premium Red Onions", "Dry, pungent, and sharp flavor red onions, a staple for every Indian kitchen.", 50.00, 38.00, catFruitsVeg, "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&auto=format&fit=crop&q=80", 3, 10, "1 kg"));
        products.add(p("Fresh Baby Spinach (Palak)", "Tender, washed green spinach leaves rich in iron and dietary fiber.", 35.00, 25.00, catFruitsVeg, "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&auto=format&fit=crop&q=80", 25, 6, "250 g bunch"));
        products.add(p("Green Bell Peppers (Capsicum)", "Crisp, mild, and flavorful green bell peppers for stir fries and pizzas.", 70.00, 55.00, catFruitsVeg, "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=600&auto=format&fit=crop&q=80", 0, 5, "500 g"));
        products.add(p("Nagpur Fresh Oranges", "Juicy, sweet and tangy Nagpur oranges loaded with immunity-boosting Vitamin C.", 120.00, 99.00, catFruitsVeg, "https://images.unsplash.com/photo-1547514701-42782101795e?w=600&auto=format&fit=crop&q=80", 18, 5, "1 kg"));
        products.add(p("Ratnagiri Alphonso Mangoes", "King of mangoes with rich aroma, velvety saffron pulp, and royal sweetness.", 650.00, 499.00, catFruitsVeg, "https://images.unsplash.com/photo-1553279768-865429fa0078?w=600&auto=format&fit=crop&q=80", 15, 4, "1 kg (approx 4 pcs)"));
        products.add(p("Sweet Pomegranates (Kesar Anar)", "Deep red Ruby pomegranate seeds bursting with antioxidant juice.", 220.00, 189.00, catFruitsVeg, "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600&auto=format&fit=crop&q=80", 20, 5, "1 kg"));
        products.add(p("Organically Grown Potatoes", "Firm, earthy yellow potatoes ideal for boiling, frying, and roasting.", 35.00, 28.00, catFruitsVeg, "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&auto=format&fit=crop&q=80", 60, 15, "1 kg"));
        products.add(p("Fresh Sweet Green Peas (Matar)", "Tender, sweet green pods packed with plant protein.", 80.00, 65.00, catFruitsVeg, "https://images.unsplash.com/photo-1587735243615-c03f25aaff15?w=600&auto=format&fit=crop&q=80", 22, 6, "500 g"));
        products.add(p("Fresh Broccoli Florets", "Nutrient-dense green broccoli heads perfect for healthy salads.", 90.00, 75.00, catFruitsVeg, "https://images.unsplash.com/photo-1459411621453-7b0316986541?w=600&auto=format&fit=crop&q=80", 16, 4, "250 g"));
        products.add(p("Tender Green Coconut", "Hydrating natural electrolyte coconut water with soft coconut meat.", 50.00, 42.00, catFruitsVeg, "https://images.unsplash.com/photo-1543362906-acfc16c67564?w=600&auto=format&fit=crop&q=80", 35, 8, "1 pc"));
        products.add(p("Crisp English Cucumbers", "Refreshing, cool, and thin-skinned salad cucumbers.", 45.00, 35.00, catFruitsVeg, "https://images.unsplash.com/photo-1447175008436-08417090ea77?w=600&auto=format&fit=crop&q=80", 28, 6, "500 g"));
        products.add(p("Fresh Juicy Lemons (Nimbu)", "Bright yellow lemons packed with natural citric zing.", 30.00, 24.00, catFruitsVeg, "https://images.unsplash.com/photo-1534531141161-e41d133a4d97?w=600&auto=format&fit=crop&q=80", 40, 10, "250 g (5-6 pcs)"));

        // === 2. DAIRY & BAKERY (15 Products) ===
        products.add(p("Amul Taaza Homogenised Toned Milk", "Pure, hygienic, long life toned milk without preservatives.", 72.00, 68.00, catDairyBakery, "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&auto=format&fit=crop&q=80", 60, 15, "1 L Tetrapack"));
        products.add(p("Amul Salted Butter", "Deliciously rich, iconic creamy salted table butter.", 275.00, 255.00, catDairyBakery, "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=600&auto=format&fit=crop&q=80", 40, 10, "500 g pack"));
        products.add(p("Fresh Malai Paneer", "Soft, succulent, and protein-dense fresh cottage cheese cubes.", 110.00, 95.00, catDairyBakery, "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&auto=format&fit=crop&q=80", 4, 8, "200 g pack"));
        products.add(p("100% Whole Wheat Brown Bread", "Nutritious, high-fiber, freshly baked artisanal brown bread.", 55.00, 48.00, catDairyBakery, "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80", 22, 6, "400 g loaf"));
        products.add(p("Nestle A+ Probiotic Dahi", "Thick, creamy curd packed with gut-friendly probiotics.", 45.00, 40.00, catDairyBakery, "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&auto=format&fit=crop&q=80", 35, 8, "400 g tub"));
        products.add(p("Farm Fresh Brown Eggs (Pack of 6)", "Organic grain-fed hen eggs rich in protein, lutein, and Omega-3.", 90.00, 75.00, catDairyBakery, "https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=600&auto=format&fit=crop&q=80", 50, 10, "6 pcs pack"));
        products.add(p("Britannia Cheese Slices", "Creamy, melty processed cheddar cheese slices for sandwiches.", 165.00, 145.00, catDairyBakery, "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=600&auto=format&fit=crop&q=80", 25, 5, "200 g (10 slices)"));
        products.add(p("Mother Dairy Cow Milk", "Pasteurized wholesome cow milk with essential nutrients.", 34.00, 32.00, catDairyBakery, "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=600&auto=format&fit=crop&q=80", 45, 10, "500 ml pouch"));
        products.add(p("Amul Fresh Cream", "Thick, smooth cooking cream for gourmet pasta, curries, and desserts.", 75.00, 69.00, catDairyBakery, "https://images.unsplash.com/photo-1559598467-f8b76c8155d0?w=600&auto=format&fit=crop&q=80", 30, 6, "250 ml pack"));
        products.add(p("Epigamia Greek Yogurt Wild Blueberry", "High-protein strained yogurt with authentic wild blueberry fruit prep.", 60.00, 52.00, catDairyBakery, "https://images.unsplash.com/photo-1571214542094-1e2254e2424b?w=600&auto=format&fit=crop&q=80", 20, 5, "100 g cup"));
        products.add(p("Milky Mist Farm Fresh Curd", "Traditional set curd made from pure cow milk.", 65.00, 58.00, catDairyBakery, "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=600&auto=format&fit=crop&q=80", 30, 8, "1 kg bucket"));
        products.add(p("Multigrain Artisanal Sandwich Bread", "Packed with flaxseeds, sunflower seeds, oat flakes, and sesame.", 70.00, 62.00, catDairyBakery, "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=600&auto=format&fit=crop&q=80", 18, 5, "400 g loaf"));
        products.add(p("Hershey's Milkshake Chocolate", "Deliciously thick, fortified milk drink loaded with cocoa.", 40.00, 35.00, catDairyBakery, "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&auto=format&fit=crop&q=80", 40, 10, "180 ml bottle"));
        products.add(p("Amul Masti Spiced Buttermilk", "Refreshing traditional chaach infused with cumin, ginger, and green chilli.", 18.00, 15.00, catDairyBakery, "https://images.unsplash.com/photo-1626078436896-1c706dfbf080?w=600&auto=format&fit=crop&q=80", 50, 12, "200 ml carton"));
        products.add(p("Garlic & Herb Gourmet Butter", "Savory butter blend infused with roasted garlic, parsley, and sea salt.", 140.00, 125.00, catDairyBakery, "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=600&auto=format&fit=crop&q=80", 15, 4, "100 g tub"));

        // === 3. SNACKS & BEVERAGES (15 Products) ===
        products.add(p("Tata Tea Gold Premium Blend", "Finest CTC tea leaves mixed with gentle aromatic long leaves.", 320.00, 289.00, catSnacks, "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80", 28, 6, "500 g pouch"));
        products.add(p("Nescafe Classic Instant Coffee", "100% pure Robusta coffee beans crafted into rich aromatic granules.", 210.00, 185.00, catSnacks, "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80", 30, 8, "100 g glass jar"));
        products.add(p("Haldiram's Bhujia Sev", "Authentic spicy crunchy moth bean and gram flour savory snack.", 125.00, 110.00, catSnacks, "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=600&auto=format&fit=crop&q=80", 40, 10, "400 g pack"));
        products.add(p("Raw Pressery Valencia Orange Juice", "100% cold pressed valencia orange juice with no added sugar.", 150.00, 129.00, catSnacks, "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=600&auto=format&fit=crop&q=80", 2, 5, "1 L bottle"));
        products.add(p("Oreo Vanilla Creme Biscuits Family Pack", "Crunchy chocolate cookies sandwiching velvety vanilla sweet cream.", 95.00, 79.00, catSnacks, "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=600&auto=format&fit=crop&q=80", 45, 10, "300 g pack"));
        products.add(p("Cadbury Dairy Milk Silk Chocolate", "Smoother, creamier, and finer melt-in-mouth milk chocolate.", 190.00, 165.00, catSnacks, "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=600&auto=format&fit=crop&q=80", 50, 12, "150 g bar"));
        products.add(p("Lays Classic Salted Potato Chips", "Crispy golden potato slices seasoned with sea salt.", 30.00, 25.00, catSnacks, "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=600&auto=format&fit=crop&q=80", 60, 15, "50 g pouch"));
        products.add(p("Kurkure Masala Munch", "Spicy, crunchy corn-rice curl snacks infused with chatpata spices.", 30.00, 25.00, catSnacks, "https://images.unsplash.com/photo-1621447504864-d8686e12698c?w=600&auto=format&fit=crop&q=80", 50, 12, "90 g pouch"));
        products.add(p("Tropicana 100% Mixed Fruit Juice", "Rich blend of apples, grapes, oranges, and bananas.", 140.00, 119.00, catSnacks, "https://images.unsplash.com/photo-1613478223719-2ab802602423?w=600&auto=format&fit=crop&q=80", 25, 6, "1 L carton"));
        products.add(p("Red Bull Energy Drink", "Vitalizes body and mind with taurine, B-group vitamins, and caffeine.", 125.00, 115.00, catSnacks, "https://images.unsplash.com/photo-1622543925917-763c34d1a86e?w=600&auto=format&fit=crop&q=80", 35, 8, "250 ml can"));
        products.add(p("Sunfeast Dark Fantasy Choco Fills", "Decadent dark chocolate cookie stuffed with molten chocolate cream.", 120.00, 99.00, catSnacks, "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&auto=format&fit=crop&q=80", 40, 10, "300 g pack"));
        products.add(p("Haldiram's Soft Gulab Jamun", "Melt-in-mouth milk solid dumplings soaked in cardamom sugar syrup.", 240.00, 210.00, catSnacks, "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=600&auto=format&fit=crop&q=80", 20, 5, "1 kg tin"));
        products.add(p("Ferrero Rocher Hazelnut Chocolates", "Whole crunchy hazelnut coated in smooth milk chocolate and crispy wafer.", 550.00, 499.00, catSnacks, "https://images.unsplash.com/photo-1548907040-4baa42d10919?w=600&auto=format&fit=crop&q=80", 15, 4, "16 pcs gift box"));
        products.add(p("Paper Boat Aamras Mango Juice", "Authentic taste of juicy Dussehri and Alphonso mango pulp.", 40.00, 35.00, catSnacks, "https://images.unsplash.com/photo-1546173159-315724a31696?w=600&auto=format&fit=crop&q=80", 45, 10, "200 ml pouch"));
        products.add(p("Saffola Masala Oats Veggie Twist", "Rolled oats infused with real vegetables and aromatic Indian spices.", 175.00, 149.00, catSnacks, "https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=600&auto=format&fit=crop&q=80", 30, 8, "500 g pack"));

        // === 4. STAPLES & ATTA (10 Products) ===
        products.add(p("Aashirvaad Shudh Chakki Whole Wheat Atta", "100% pure wheat grain chakki ground flour for soft rotis.", 380.00, 345.00, catStaples, "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80", 40, 10, "10 kg bag"));
        products.add(p("India Gate Basmati Rice Feast Rozana", "Aromatic, long-grain aged basmati rice for daily biryani & pulao.", 450.00, 399.00, catStaples, "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80", 35, 8, "5 kg bag"));
        products.add(p("Fortune Sunlite Refined Sunflower Oil", "Light, easy-to-digest refined cooking oil enriched with Vitamins A & D.", 155.00, 138.00, catStaples, "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&auto=format&fit=crop&q=80", 50, 12, "1 L pouch"));
        products.add(p("Tata Salt Vacuum Evaporated Iodized Salt", "Desh Ka Namak, pure iodized table salt.", 28.00, 24.00, catStaples, "https://images.unsplash.com/photo-1518110168401-f2877ee2c085?w=600&auto=format&fit=crop&q=80", 80, 20, "1 kg pouch"));
        products.add(p("Organic Unpolished Arhar / Toor Dal", "High-protein yellow pigeon peas sourced directly from organic farms.", 160.00, 142.00, catStaples, "https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?w=600&auto=format&fit=crop&q=80", 30, 8, "1 kg pack"));
        products.add(p("Fortune Premium Kachi Ghani Mustard Oil", "Cold pressed pungent mustard oil ideal for traditional Indian curries.", 170.00, 149.00, catStaples, "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&auto=format&fit=crop&q=80", 25, 6, "1 L bottle"));
        products.add(p("Organic Unpolished Chana Dal", "Nutritious split Bengal gram high in dietary fiber.", 110.00, 95.00, catStaples, "https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?w=600&auto=format&fit=crop&q=80", 28, 6, "1 kg pack"));
        products.add(p("Rajdhani Moong Dal Dhuli", "Easy-to-digest washed yellow moong dal for wholesome khichdi.", 145.00, 128.00, catStaples, "https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?w=600&auto=format&fit=crop&q=80", 30, 8, "1 kg pack"));
        products.add(p("Catch Super Garam Masala Blend", "Handcrafted blend of roasted cardamom, cinnamon, cloves & mace.", 95.00, 82.00, catStaples, "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&auto=format&fit=crop&q=80", 40, 10, "100 g pack"));
        products.add(p("Madhur Pure & Hygienic Refined Sugar", "Sulphur-free, sparkling white refined sugar crystals.", 55.00, 48.00, catStaples, "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&auto=format&fit=crop&q=80", 60, 15, "1 kg pouch"));

        // === 5. HOUSEHOLD ESSENTIALS (10 Products) ===
        products.add(p("Surf Excel Matic Top Load Liquid Detergent", "Superior stain removal in washing machines with 100% stain elimination.", 440.00, 385.00, catHousehold, "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=600&auto=format&fit=crop&q=80", 20, 5, "2 L bottle"));
        products.add(p("Vim Lemon Dishwash Gel", "Power of 100 lemons removing tough burnt grease instantly.", 135.00, 115.00, catHousehold, "https://images.unsplash.com/photo-1585837575652-267c041d77d4?w=600&auto=format&fit=crop&q=80", 35, 8, "750 ml bottle"));
        products.add(p("Dettol Antiseptic Liquid", "Trusted multi-purpose first aid and household germ protection.", 225.00, 199.00, catHousehold, "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80", 30, 6, "500 ml bottle"));
        products.add(p("Origami 2-Ply Kitchen Paper Towels", "Super absorbent, food-safe embossed virgin paper roll.", 160.00, 130.00, catHousehold, "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=600&auto=format&fit=crop&q=80", 25, 5, "2 rolls pack"));
        products.add(p("Lizol Pine Floor Cleaner Disinfectant", "Kills 99.9% germs, leaves long-lasting pleasant pine fragrance.", 195.00, 175.00, catHousehold, "https://images.unsplash.com/photo-1585837575652-267c041d77d4?w=600&auto=format&fit=crop&q=80", 28, 6, "1 L bottle"));
        products.add(p("Harpic Power Plus Toilet Cleaner", "Thick 10X stain remover disinfectant liquid.", 215.00, 189.00, catHousehold, "https://images.unsplash.com/photo-1585837575652-267c041d77d4?w=600&auto=format&fit=crop&q=80", 30, 8, "1 L bottle"));
        products.add(p("Colin Glass & Surface Cleaner Spray", "Shine booster streak-free formula for glass windows and mirrors.", 120.00, 105.00, catHousehold, "https://images.unsplash.com/photo-1585837575652-267c041d77d4?w=600&auto=format&fit=crop&q=80", 22, 5, "500 ml spray"));
        products.add(p("Ariel Matic Front Load Washing Powder", "Deep cleaning enzyme technology tailored for front load machines.", 550.00, 489.00, catHousehold, "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=600&auto=format&fit=crop&q=80", 18, 4, "2 kg box"));
        products.add(p("Comfort After Wash Fabric Conditioner", "Long-lasting morning fresh fragrance and velvet softness for clothes.", 230.00, 199.00, catHousehold, "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=600&auto=format&fit=crop&q=80", 25, 6, "860 ml bottle"));
        products.add(p("Godrej aer Pocket Bathroom Fragrance", "Power gel technology keeping bathroom fragrant for up to 30 days.", 60.00, 52.00, catHousehold, "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=600&auto=format&fit=crop&q=80", 40, 10, "10 g sachet"));

        productRepository.deleteAll();
        List<Product> savedProducts = productRepository.saveAll(products);

        // 4. Initialize Pickup Slots for today and upcoming 5 days
        pickupSlotService.getUpcomingSlots(5);

        // 5. Create Realistic Seed Orders for Demonstration
        returnRepository.deleteAll();
        orderRepository.deleteAll();

        Product apple = savedProducts.get(0);
        Product taazaMilk = savedProducts.get(7);
        Product butter = savedProducts.get(8);
        Product tea = savedProducts.get(13);

        // Order 1: Delivered (for return demo)
        OrderItem item1 = OrderItem.builder()
                .id(UUID.randomUUID().toString())
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
                .id(UUID.randomUUID().toString())
                .product(butter)
                .productName(butter.getName())
                .productUnit(butter.getUnit())
                .productImageUrl(butter.getImageUrl())
                .unitPrice(butter.getEffectivePrice())
                .quantity(1)
                .totalPrice(butter.getEffectivePrice())
                .returned(false)
                .build();

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
                .items(List.of(item1, item2))
                .build();

        Order savedDeliveredOrder = orderRepository.save(deliveredOrder);

        // Order 2: Placed Store Pickup (for fulfillment demo)
        OrderItem item3 = OrderItem.builder()
                .id(UUID.randomUUID().toString())
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
                .id(UUID.randomUUID().toString())
                .product(tea)
                .productName(tea.getName())
                .productUnit(tea.getUnit())
                .productImageUrl(tea.getImageUrl())
                .unitPrice(tea.getEffectivePrice())
                .quantity(1)
                .totalPrice(tea.getEffectivePrice())
                .returned(false)
                .build();

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
                .items(List.of(item3, item4))
                .build();

        orderRepository.save(placedOrder);

        // 6. Create a Sample Return Request
        ReturnExchangeRequest sampleReturn = ReturnExchangeRequest.builder()
                .requestNumber("RET-2026-DEMO01")
                .order(savedDeliveredOrder)
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
                .userEmail("system@shopai.com")
                .action(AuditAction.PRODUCT_CREATE)
                .entityType("SYSTEM")
                .entityId("INIT")
                .description("ShopAI catalog and role data initialized successfully in MongoDB")
                .ipAddress("127.0.0.1")
                .build());

        log.info("ShopAI MongoDB Seeding completed successfully!");
    }

    private Product p(String name, String desc, double price, double discountPrice, Category category, String img, int stock, int lowStock, String unit) {
        return Product.builder()
                .name(name)
                .description(desc)
                .price(BigDecimal.valueOf(price))
                .discountPrice(discountPrice > 0 ? BigDecimal.valueOf(discountPrice) : null)
                .category(category)
                .imageUrl(img)
                .stockQuantity(stock)
                .lowStockThreshold(lowStock)
                .unit(unit)
                .active(true)
                .build();
    }
}
