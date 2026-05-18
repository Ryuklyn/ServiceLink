package com.servicelink.core.controller.business;

import com.servicelink.core.dto.request.business.WorkspaceRequest;
import com.servicelink.core.dto.response.business.WorkspaceResponse;
import com.servicelink.core.service.business.WorkspaceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/business/workspace")
public class WorkspaceController {

    private final WorkspaceService workspaceService;

    @PostMapping
    public ResponseEntity<WorkspaceResponse> create(@Valid @RequestBody WorkspaceRequest request){
        return ResponseEntity.status(HttpStatus.CREATED).body(workspaceService.create(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<WorkspaceResponse> getById(@PathVariable Long id ){
        return ResponseEntity.ok(workspaceService.findById(id));
    }

//    @GetMapping
//    public ResponseEntity<List<WorkspaceResponse>> getAll(){
//        return ResponseEntity.ok(workspaceService.findAll());
//    }
}
