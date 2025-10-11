### Lab 7 - Design Patterns Implementation

### Source Code Files

### 1. Strategy Pattern Implementation

#### Core Pattern Files
- [ResourceProcessingStrategy.java](backend/src/main/java/com/se2030/backend/strategy/ResourceProcessingStrategy.java) - Strategy interface defining the contract for resource processing
- [MaterialProcessingStrategy.java](backend/src/main/java/com/se2030/backend/strategy/MaterialProcessingStrategy.java) - Concrete strategy for processing material resources
- [EquipmentProcessingStrategy.java](backend/src/main/java/com/se2030/backend/strategy/EquipmentProcessingStrategy.java) - Concrete strategy for processing equipment resources
- [ResourceProcessingContext.java](backend/src/main/java/com/se2030/backend/strategy/ResourceProcessingContext.java) - Context class that manages and uses different strategies

#### Integration Files
- [InventoryService.java](backend/src/main/java/com/se2030/backend/service/InventoryService.java) - Service class that uses the Strategy pattern for resource processing

### 2. Observer Pattern Implementation

#### Core Pattern Files
- [ProjectStatusObserver.java](backend/src/main/java/com/se2030/backend/observer/ProjectStatusObserver.java) - Observer interface defining the contract for project status notifications
- [ClientSMSNotificationObserver.java](backend/src/main/java/com/se2030/backend/observer/ClientSMSNotificationObserver.java) - Concrete observer that sends SMS notifications to clients
- [ProjectStatusSubject.java](backend/src/main/java/com/se2030/backend/observer/ProjectStatusSubject.java) - Subject class that manages observers and notifies them of changes

#### Integration Files
- [ProjectService.java](backend/src/main/java/com/se2030/backend/service/ProjectService.java) - Service class that uses the Observer pattern for project status notifications
- [TwilioService.java](backend/src/main/java/com/se2030/backend/service/TwilioService.java) - SMS service that handles Twilio integration for sending notifications

### Configuration Files
- [application.properties](backend/src/main/resources/application.properties) - Configuration file containing Twilio settings and other application properties