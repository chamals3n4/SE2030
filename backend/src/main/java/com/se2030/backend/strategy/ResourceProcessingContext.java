package com.se2030.backend.strategy;

import com.se2030.backend.model.CompanyStock;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ResourceProcessingContext {
    
    @Autowired
    private List<ResourceProcessingStrategy> strategies;
    
    private Map<String, ResourceProcessingStrategy> strategyMap;
    
    @PostConstruct
    public void init() {
        strategyMap = new HashMap<>();
        for (ResourceProcessingStrategy strategy : strategies) {
            strategyMap.put(strategy.getResourceType().toUpperCase(), strategy);
        }
        System.out.println("Resource Processing Context initialized with strategies: " + strategyMap.keySet());
    }
    
    public CompanyStock processResource(String resourceType, Long resourceId, Integer quantity, BigDecimal unitCost, String name, String description) {
        ResourceProcessingStrategy strategy = strategyMap.get(resourceType.toUpperCase());
        if (strategy == null) {
            throw new IllegalArgumentException("Unsupported resource type: " + resourceType + 
                                             ". Supported types: " + strategyMap.keySet());
        }
        
        return strategy.processResource(resourceId, quantity, unitCost, name, description);
    }
    
    public boolean isResourceTypeSupported(String resourceType) {
        return strategyMap.containsKey(resourceType.toUpperCase());
    }
    
    public String[] getSupportedResourceTypes() {
        return strategyMap.keySet().toArray(new String[0]);
    }
}
