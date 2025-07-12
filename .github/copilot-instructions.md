# GitHub Copilot Instructions

## Project Overview

This is a **GitHub Profile Card Widget** - a vanilla JavaScript/TypeScript library that displays GitHub user profiles and repositories on websites. The widget is built with modern TypeScript, uses no external dependencies, and follows a modular architecture.

### Key Technologies
- **TypeScript** (v3.7.5) - Primary language
- **Jest** (v24.9.0) - Testing framework
- **ESBuild** - Build tool (can evolve as needed)
- **SCSS** - Styling
- **Vanilla JavaScript** - No frameworks, pure browser compatibility

## Architecture & Code Organization

### Core Components
- `gh-profile-card.ts` - Main widget class and entry point
- `gh-data-loader.ts` - GitHub API interaction and data fetching
- `gh-dom-operator.ts` - DOM manipulation and rendering
- `gh-cache-storage.ts` - Caching mechanism for API responses
- `gh-widget-init.ts` - Widget initialization and configuration

### Directory Structure
```
src/
├── interface/          # TypeScript interfaces and types
├── css/               # SCSS stylesheets
└── testing/           # Test utilities and mocks
```

### Key Interfaces
- `WidgetConfig` - Widget configuration options
- `ApiProfile` - GitHub user profile data structure
- `ApiRepository` - GitHub repository data structure
- `ApiUserData` - Combined user data (profile + repositories)

## Core Principles

### Type Safety
- Use **TypeScript strict mode** for all code
- Define clear interfaces for data structures
- Leverage type checking to prevent runtime errors

### Error Handling
- Use custom `ApiError` interface for API-related errors
- Distinguish between network errors and user-not-found errors
- Provide meaningful error messages to users
- Implement graceful degradation

### Performance
- **Prefer** caching API responses to reduce GitHub rate limiting
- **Consider** lazy loading for non-critical features like language statistics
- **Minimize** DOM manipulations when performance is a concern
- **Evaluate** debouncing for user-triggered API calls

### Accessibility
- Ensure proper **semantic HTML** structure
- Use appropriate **ARIA labels** where needed
- Support **keyboard navigation** patterns
- Maintain **color contrast** standards

## Development Guidelines

### Testing Strategy
- **Prefer** using `src/testing/` utilities for consistent test setup
- Extract results to separate variables for better debugging
- Mock external dependencies (API, DOM, storage) unless integration testing
- Test both success and error scenarios
- Include edge cases and invalid inputs
- Use Given-When-Then style for test cases
- Avoid overcomplexity in tests; keep them focused on single behaviors

### Key Testing Utilities
- `mock-github-data.ts` - Standardized GitHub API mock data
- `fetch-mock.ts` - HTTP request mocking utilities  
- `cache-mock.ts` - Cache storage mocking
- `test-utils.ts` - Common test helper functions

### API Integration
- **Use** GitHub REST API v3 for consistency with existing implementation
- **Implement** caching to reduce API calls and respect rate limits
- **Handle** rate limiting gracefully with proper error messages
- **Support** error states (network, 404, invalid JSON)
- **Consider** retry logic for transient failures

### Widget Configuration
Support both **programmatic** and **HTML data-attribute** configuration:
```html
<div id="github-card" 
     data-username="piotrl"
     data-sort-by="stars"
     data-max-repos="5"
     data-hide-top-languages="false">
</div>
```

## Flexible Development Patterns

### Adding New Features (Adapt as Needed)
**Typical workflow:**
1. **Consider** defining TypeScript interfaces in `src/interface/` for type safety
2. Implement core logic with appropriate error handling
3. **Prefer** comprehensive unit tests for maintainability
4. Update DOM operator for rendering if UI changes needed
5. **Consider** integration tests for complex workflows
6. Update documentation for public API changes

**Escape hatches:** For simple features or prototypes, feel free to iterate and refactor the structure as the feature evolves.

### Modifying GitHub API Integration
**Typical workflow:**
1. Update interfaces in `IGitHubApi.ts` if data structures change
2. Modify `gh-data-loader.ts` implementation
3. **Prefer** updating mock data in `testing/mock-github-data.ts` for consistency
4. Add/update tests for new API behavior
5. **Consider** backwards compatibility impact

**Escape hatches:** For experimental API features, prototype first and formalize interfaces later.

### Styling Changes
**Preferences:**
1. **Prefer** modifying SCSS files in `src/css/` for consistency
2. **Consider** BEM methodology for CSS classes (but not required)
3. **Use** CSS custom properties for theming when appropriate
4. **Test** responsive design across devices
5. **Validate** accessibility impact

**Flexibility:** Use whatever CSS methodology makes sense for the specific change.

### Testing New Components
**Strong preferences:**
1. **Use** existing test utilities from `src/testing/` unless specific requirements dictate otherwise
2. Mock external dependencies (API, DOM, storage) for unit tests
3. Test both success and error scenarios
4. Include edge cases and invalid inputs
5. Verify TypeScript type safety

**Adaptations:** For complex integration scenarios, feel free to create specialized test setups.

## Build & Development Environment

### Development Commands
- `npm run build` - Production build
- `npm run test` - Run all tests
- `npm run test:watch` - Watch mode testing
- `npm run lint` - ESLint validation
- `npm run format` - Prettier formatting

### Build Process (Current Setup)
- **ESBuild** compiles TypeScript to optimized JavaScript
- **SCSS** compiled to minified CSS
- **Bundle** created for browser distribution
- **Source maps** generated for debugging

*Note: Build tooling can evolve as project needs change*

## Browser Compatibility & Standards

### Target Environment
- **Modern browsers** (ES2017+) - current target
- **TypeScript compilation** provides compatibility layer
- **Avoid** experimental browser features unless polyfilled
- **Test** in multiple browsers for production releases

## Contributing Guidelines

### Requirements (Non-negotiable)
- All tests must pass (`npm run test`)
- Code must be linted (`npm run lint`)
- Code must be formatted (`npm run format`)
- Handle GitHub API rate limiting appropriately
- Maintain accessibility standards

### Strong Preferences
- Add tests for new functionality
- Update documentation for API changes
- Use TypeScript interfaces for new data structures
- Follow established error handling patterns

### Code Review Focus Areas
- **Type safety** - Proper TypeScript usage
- **Test coverage** - Adequate test scenarios
- **Performance** - Consider impact on widget load time
- **Accessibility** - Semantic markup and ARIA when needed
- **API compatibility** - Don't break existing integrations

## Debugging & Troubleshooting

### Common Issues & Solutions
- **CORS errors** - Ensure proper GitHub API usage
- **Rate limiting** - Verify caching implementation
- **DOM not ready** - Check initialization timing
- **TypeScript errors** - Validate interface implementations

### Debugging Tools
- Browser DevTools for DOM inspection and network analysis
- Jest test runner for isolated component testing
- TypeScript compiler for type checking
- ESLint for code quality validation

## Security & Data Handling

### Security Practices
- **Sanitize** all user-provided data
- **Validate** GitHub API responses
- **Avoid** direct DOM innerHTML injection when possible
- **Use** Content Security Policy compatible code
- **Handle** potentially malicious repository data gracefully

### Performance Monitoring
- **Monitor** bundle size impact of changes
- **Consider** API response times for user experience
- **Measure** DOM rendering performance for large datasets
- **Validate** memory usage patterns
- **Test** cache effectiveness

## Flexibility & Evolution

### When to Deviate from Guidelines
- **Performance requirements** dictate different approaches
- **Specific feature needs** require specialized patterns
- **External constraints** (APIs, libraries) require adaptations
- **Prototyping phase** needs faster iteration

### Documentation for Deviations
When deviating from established patterns:
1. Document the reason for deviation
2. Consider long-term maintenance impact
3. Update guidelines if pattern proves beneficial
4. Ensure team awareness of new patterns
