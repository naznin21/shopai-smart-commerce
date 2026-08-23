package com.minidmart.dto;

import com.minidmart.enums.ReturnStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProcessReturnRequest {

    @NotNull(message = "Decision status is required (APPROVED, REJECTED, or COMPLETED)")
    private ReturnStatus status;

    private String adminNotes;

    @Builder.Default
    private boolean restockInventory = true;
}
