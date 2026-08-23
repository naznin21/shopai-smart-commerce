package com.minidmart.controller;

import com.minidmart.dto.CreateReturnRequest;
import com.minidmart.dto.ReturnExchangeRequestDto;
import com.minidmart.service.ReturnExchangeService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/returns")
@RequiredArgsConstructor
public class ReturnExchangeController {

    private final ReturnExchangeService returnExchangeService;

    @PostMapping
    public ResponseEntity<ReturnExchangeRequestDto> createRequest(
            @Valid @RequestBody CreateReturnRequest request,
            HttpServletRequest servletRequest) {
        String ipAddress = servletRequest.getRemoteAddr();
        return new ResponseEntity<>(returnExchangeService.createRequest(request, ipAddress), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<ReturnExchangeRequestDto>> getMyRequests() {
        return ResponseEntity.ok(returnExchangeService.getCustomerRequests());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReturnExchangeRequestDto> getRequestById(@PathVariable Long id) {
        return ResponseEntity.ok(returnExchangeService.getRequestById(id));
    }
}
