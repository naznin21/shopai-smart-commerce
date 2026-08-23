package com.minidmart.config;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaRedirectController {

    @GetMapping(value = {
        "/",
        "/login",
        "/register",
        "/shop",
        "/product/**",
        "/cart",
        "/checkout",
        "/order-confirmation/**",
        "/orders",
        "/orders/**",
        "/profile",
        "/dashboard",
        "/staff",
        "/admin"
    })
    public String forwardSpaRoutes() {
        return "forward:/index.html";
    }
}
