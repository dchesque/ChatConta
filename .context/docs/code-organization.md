# Code Organization Guide

# Code Organization Guide for the Assistenten Financeiro Pessoal Codebase

This guide aims to provide clarity on the structure and organization of the codebase, enabling developers to navigate, extend, and maintain the application effectively.

## 1. Directory Structure Logic

The directory structure is designed to promote modularity and separation of concerns. Each major feature or concern has its own directory, making it easier to locate related files and maintain the code. Here’s a breakdown of the primary directories:

- **Components**: Contains reusable UI components, which follow a modular approach, allowing for easy integration and reuse across different parts of the application.
- **Config**: Holds configuration files that dictate application behavior, separating configuration from logic.
- **Constants**: Contains constant values used throughout the application, ensuring consistency and easy management of shared values.
- **Core**: The foundational logic of the application, including core services and utilities that are essential for the app’s functionality.
- **Docs**: Documentation files that provide guidance on using and contributing to the project.
- **Hooks**: Custom React hooks that encapsulate reusable logic for UI components, promoting cleaner components.
- **Integrations**: Deals with third-party service integrations, allowing for clear separation from core app logic.
- **Lib**: Utility libraries or modules that provide shared functionality across the app.
- **Pages**: Defines the main views or pages of the application, organized to reflect the app’s routing structure.
- **Repositories**: Data access layer, managing interactions with databases or APIs.

## 2. Module Boundaries

Each module is defined by a specific responsibility:

- **Components**: Should only contain UI elements, such as buttons, forms, and layout components. Avoid including business logic here.
- **Config**: Store settings and configurations that can change based on different environments (e.g., development, production).
- **Constants**: Should only contain static values that are used across multiple modules, such as action types or API endpoints.
- **Core**: Implement core business logic and services, ensuring that other modules can leverage these functionalities without duplicating code.
- **Hooks**: Custom hooks should encapsulate complex stateful logic, allowing for cleaner and more maintainable components.
- **Integrations**: Manage all external service connections, ensuring that the core application logic remains agnostic to external services.
- **Lib**: Contains utility functions that can be used throughout the application, promoting DRY (Don't Repeat Yourself) principles.
- **Pages**: Organize the structure of the application’s routing and layout, directly mapping to user-facing views.
- **Repositories**: Responsible for data-fetching logic, keeping it separate from the business logic in the Core module.

## 3. Naming Conventions

Consistent naming conventions enhance readability and maintainability:

- **Files and Folders**: Use camelCase for files and directories (e.g., `myComponent.tsx`, `userProfilePage.tsx`).
- **Constants**: Use uppercase with underscores for constant values (e.g., `MAX_USER_COUNT`).
- **Variables**: Use descriptive names that clearly indicate their purpose (e.g., `userData`, `fetchUserDetails`).
- **Components**: Component names should always be PascalCase (e.g., `UserProfile`, `TransactionList`).

## 4. Dependency Flow

Understanding module dependencies is crucial for maintaining a clean architecture:

- **Components** depend on the **Root Files** for state management and data.
- **Core**, **Repositories**, and **Supabase** are foundational and can be utilized across various modules, promoting a central source of truth.
- Avoid circular dependencies; for instance, if **Components** rely on **Core**, ensure that **Core** does not depend back on **Components**.
- Use dependency injection or context providers where necessary to manage shared state and services without tight coupling.

## 5. Extension Points

For adding new functionality, leverage the identified extension points:

- **Configuration**: New configuration settings should be added to the **Config** module. This helps in maintaining environment-specific configurations without touching the core business logic.
- **Database Migrations**: When adding new database features, create migration files under the **supabase/migrations/** directory. This ensures that your database schema evolves in sync with your application.
- **Custom Hooks**: If you find yourself repeating logic across components, consider creating a new custom hook in the **Hooks** module, promoting reusability.
- **New Components**: For UI changes, create new components within the **Components** module, following the established naming conventions.

### Summary

By adhering to this structure and these principles, developers can easily navigate the codebase, add new features, and maintain the application efficiently. The modular design encourages collaboration and reduces the risk of introducing bugs while enhancing the overall quality of the code. Always refer to existing patterns in the codebase when adding new features or making changes.

---
*Generated by AI Coders Context*

*Generated on: 2025-08-24T21:00:45.564Z*
