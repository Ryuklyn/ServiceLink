package com.servicelink.core.controller.business;

import com.servicelink.core.dto.request.business.WorkspaceRequest;
import com.servicelink.core.dto.response.business.WorkspaceResponse;
import com.servicelink.core.service.business.WorkspaceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/business/workspace")
public class WorkspaceController {

    private WorkspaceService workspaceService;

    @PostMapping
    public ResponseEntity<WorkspaceResponse> create(@Valid @RequestBody WorkspaceRequest request){
        return ResponseEntity.status(HttpStatus.CREATED).body(workspaceService.create(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<WorkspaceResponse> getById(@PathVariable Long id ){
        return ResponseEntity.ok(workspaceService.findById(id));
    }
}
