# Implementation Plan: Global Relocation Intelligence Engine

## Overview

This implementation plan breaks down the Global Relocation Intelligence Engine into discrete coding tasks organized for parallel development. The system consists of a Node.js/Express backend with 10 modular components, a React frontend dashboard, and comprehensive property-based testing using Jest and fast-check.

The tasks are structured to enable early validation of core functionality, with property tests placed close to their corresponding implementations to catch errors quickly. All test-related sub-tasks are marked as optional (*) for faster MVP delivery.

## Tasks

- [ ] 1. Project setup and core infrastructure
  - Initialize Node.js project with TypeScript, Express, and testing dependencies (Jest, fast-check, supertest)
  - Create directory structure: `/src/api`, `/src/modules`, `/src/utils`, `/src/types`, `/tests`
  - Configure TypeScript with strict mode and module resolution
  - Set up environment variables for API keys (OpenWeatherMap, WAQI)
  - Create shared TypeScript interfaces for all data models (CountryData, IntelligenceScores, UserPreferences, etc.)
  - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [ ] 2. Implement Cache Manager module
  - [ ] 2.1 Create CacheManager class with in-memory Map storage
    - Implement `set(key, data, ttl)` method with timestamp and expiration tracking
    - Implement `get(key)` method with expiration checking and automatic cleanup
    - Implement `isExpired(key)` helper method
    - Implement `clear(key)` method for manual invalidation
    - Generate cache keys in format `{apiName}:{countryCode}`
    - _Requirements: 4.1, 4.2, 4.5_
  
  - [ ]* 2.2 Write property test for Cache TTL Enforcement
    - **Property 5: Cache TTL Enforcement**
    - **Validates: Requirements 4.1, 4.2, 4.5**
    - Test that data accessed within 60 minutes returns cached data, after 60 minutes triggers fresh fetch
    - Use fast-check with time simulation (jest.advanceTimersByTime)
    - _Requirements: 12.4_
  
  - [ ] 2.3 Add cache operation logging
    - Log cache hits with key and timestamp
    - Log cache misses with key and timestamp
    - Track hit/miss counts for metadata generation
    - _Requirements: 4.6, 11.2, 11.3_

- [ ] 3. Implement Normalization Engine module
  - [ ] 3.1 Create NormalizationEngine class with normalize method
    - Implement min-max normalization: `((value - min) / (max - min)) * 100`
    - Implement inverted normalization for "lower is better" metrics
    - Implement clamping to [0, 100] range
    - Define metric-specific ranges (temperature: -50 to 50, AQI: 0 to 500, life expectancy: 50 to 85, etc.)
    - _Requirements: 2.1, 2.6_
  
  - [ ]* 3.2 Write property test for Normalization Bounds
    - **Property 1: Normalization Bounds**
    - **Validates: Requirements 2.1, 2.6**
    - Test that any raw metric value normalizes to 0-100 inclusive
    - Use fast-check with arbitrary float inputs for raw values, min, and max
    - _Requirements: 12.1_
  
  - [ ]* 3.3 Write unit tests for normalization edge cases
    - Test normalization at min value (should return 0)
    - Test normalization at max value (should return 100)
    - Test normalization with out-of-range values (should clamp)
    - Test inverted normalization for AQI and temperature extremes
    - _Requirements: 2.1, 2.6_

- [ ] 4. Implement Dynamic Weighting Engine module
  - [ ] 4.1 Create DynamicWeightingEngine class with calculateWeights method
    - Implement risk tolerance weight calculation (Low/Moderate/High affects AQI, advisory, temperature penalties)
    - Implement duration weight calculation (Short-term/Long-term affects final score component weights)
    - Return ScoreWeights object with travelRisk, healthInfrastructure, environmentalStability weights
    - Ensure weights are computed programmatically, not from static tables
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_
  
  - [ ]* 4.2 Write property test for Dynamic Weight Differentiation
    - **Property 12: Dynamic Weight Differentiation**
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**
    - Test that different preference combinations produce different weights
    - Use fast-check to generate pairs of different UserPreferences
    - _Requirements: 12.6_
  
  - [ ]* 4.3 Write unit tests for specific weight values
    - Test Low risk tolerance produces higher AQI/advisory penalties
    - Test High risk tolerance produces lower AQI/advisory penalties
    - Test Short-term duration increases Environmental Stability weight
    - Test Long-term duration increases Health Infrastructure weight
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 5. Implement Scoring Module
  - [ ] 5.1 Create ScoringModule class with computeScores method
    - Integrate NormalizationEngine for metric normalization
    - Integrate DynamicWeightingEngine for weight calculation
    - Implement Travel Risk Score computation from temperature extremes, AQI severity, advisory risk
    - Implement Health Infrastructure Score computation from healthcare expenditure, life expectancy, population pressure
    - Implement Environmental Stability Score computation from weather volatility, AQI trends
    - Compute weighted aggregate score using dynamic weights
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
  
  - [ ]* 5.2 Write property test for Score Composition Completeness
    - **Property 2: Score Composition Completeness**
    - **Validates: Requirements 2.5**
    - Test that any country with available data produces exactly 3 scores, all in 0-100 range
    - Use fast-check to generate arbitrary CountryData
    - _Requirements: 12.1_
  
  - [ ]* 5.3 Write property test for Multi-Factor Ranking Requirement
    - **Property 13: Multi-Factor Ranking Requirement**
    - **Validates: Requirements 6.6**
    - Test that weighted scores are derived from at least 2 components with non-zero weights
    - Use fast-check to generate arbitrary UserPreferences
    - _Requirements: 6.6_
  
  - [ ]* 5.4 Write unit tests for score computation with known inputs
    - Test Travel Risk Score with specific temperature, AQI, advisory values
    - Test Health Infrastructure Score with specific healthcare, life expectancy, population values
    - Test Environmental Stability Score with specific volatility and AQI trend values
    - Test weighted score aggregation with known weights
    - Test handling of missing metrics (partial data scenarios)
    - _Requirements: 2.2, 2.3, 2.4_

- [ ] 6. Checkpoint - Ensure core scoring logic is validated
  - Run all tests for Normalization, Weighting, and Scoring modules
  - Verify property tests pass with 100+ iterations
  - Ask the user if questions arise

- [ ] 7. Implement API Aggregator module
  - [ ] 7.1 Create APIAggregator class with fetchCountryData method
    - Implement REST Countries API integration (no auth required)
    - Implement World Bank API integration for life expectancy and healthcare expenditure
    - Implement OpenWeatherMap API integration with API key from environment
    - Implement WAQI API integration with token from environment
    - Use Promise.all for concurrent execution of all 4 API calls per country
    - Implement 5-second timeout per API call using Promise.race
    - Parse responses into CountryData structure
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 8.3_
  
  - [ ] 7.2 Integrate Cache Manager with API Aggregator
    - Check cache before making external API calls
    - Store fresh API responses in cache with 60-minute TTL
    - Return cached data when available and not expired
    - Track cache hits and misses for metadata
    - _Requirements: 4.1, 4.2_
  
  - [ ] 7.3 Implement API call logging and error handling
    - Log each API call with name, start time, duration, and response status
    - Handle timeout errors (treat as failures, continue with partial data)
    - Handle non-2xx status codes (treat as failures, log error)
    - Handle network errors (treat as failures, log error)
    - Return AggregatedData with successful results, failures array, and durations map
    - _Requirements: 1.6, 5.3, 8.4_
  
  - [ ]* 7.4 Write property test for Concurrent API Execution Efficiency
    - **Property 6: Concurrent API Execution Efficiency**
    - **Validates: Requirements 1.5**
    - Test that total execution time ≤ max individual duration + overhead, not sum of durations
    - Use mocked APIs with controlled delays
    - _Requirements: 1.5_
  
  - [ ]* 7.5 Write property test for API Timeout Handling
    - **Property 11: API Timeout Handling**
    - **Validates: Requirements 8.3, 8.4**
    - Test that API calls exceeding 5 seconds are treated as failures
    - Use mocked APIs with delays >5 seconds
    - _Requirements: 8.3, 8.4_
  
  - [ ]* 7.6 Write unit tests for API integration
    - Mock all 4 external APIs
    - Test successful data fetching and parsing
    - Test individual API failure handling
    - Test cache hit scenario (second request returns cached data)
    - Test cache miss scenario (first request fetches fresh data)
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 4.1, 4.2_

- [ ] 8. Implement Reasoning Generator module
  - [ ] 8.1 Create ReasoningGenerator class with generateReasoning method
    - Identify top 2-3 contributing factors based on component scores
    - Generate structured reasoning text referencing specific metrics
    - Adapt language based on user preferences (emphasize health for long-term, environment for short-term)
    - Use template: "{Country} ranks {rank} with a weighted score of {score}/100. Key factors: {factor1} ({metric1}), {factor2} ({metric2}). {Additional context}."
    - _Requirements: 6.2_
  
  - [ ]* 8.2 Write unit tests for reasoning generation
    - Test reasoning includes at least 2 contributing factors
    - Test reasoning references specific metrics
    - Test reasoning adapts to user preferences
    - Test reasoning format matches template
    - _Requirements: 6.2_

- [ ] 9. Implement Ranking Engine module
  - [ ] 9.1 Create RankingEngine class with rankCountries method
    - Sort countries by weightedScore in descending order
    - Apply alphabetical tiebreaker when scores are equal
    - Assign rank numbers (1, 2, 3, ...)
    - Integrate ReasoningGenerator for each ranked country
    - Return array of RankedCountry objects
    - _Requirements: 6.1, 6.3_
  
  - [ ]* 9.2 Write property test for Ranking Monotonicity
    - **Property 3: Ranking Monotonicity**
    - **Validates: Requirements 6.1**
    - Test that countries are ranked in descending order by weighted score
    - Use fast-check to generate arbitrary arrays of countries with scores
    - _Requirements: 12.3_
  
  - [ ]* 9.3 Write property test for Alphabetical Tiebreaker Consistency
    - **Property 4: Alphabetical Tiebreaker Consistency**
    - **Validates: Requirements 6.3**
    - Test that countries with identical scores are ordered alphabetically
    - Use fast-check to generate countries with duplicate scores
    - _Requirements: 6.3_
  
  - [ ]* 9.4 Write unit tests for ranking scenarios
    - Test ranking with distinct scores (3, 5, 10 countries)
    - Test ranking with identical scores (verify alphabetical order)
    - Test ranking with mixed scores (some duplicates)
    - _Requirements: 6.1, 6.3_

- [ ] 10. Implement Request Validator module
  - [ ] 10.1 Create RequestValidator class with validate method
    - Validate countries array has minimum length 3
    - Validate riskTolerance is 'Low', 'Moderate', or 'High'
    - Validate duration is 'Short-term' or 'Long-term'
    - Return ValidationResult with valid flag and errors array
    - _Requirements: 7.2, 7.3, 7.4_
  
  - [ ]* 10.2 Write property test for Validation Error Response
    - **Property 10: Validation Error Response**
    - **Validates: Requirements 7.2, 7.3, 7.4, 7.5**
    - Test that invalid requests return HTTP 400 with descriptive error message
    - Use fast-check to generate invalid AnalysisRequest objects
    - _Requirements: 7.5_
  
  - [ ]* 10.3 Write unit tests for validation rules
    - Test validation with valid inputs (should pass)
    - Test validation with <3 countries (should fail)
    - Test validation with invalid risk tolerance (should fail)
    - Test validation with invalid duration (should fail)
    - Test validation with multiple errors (should return all errors)
    - _Requirements: 7.2, 7.3, 7.4_

- [ ] 11. Implement Observability Logger module
  - [ ] 11.1 Create ObservabilityLogger class with structured logging methods
    - Implement logAPICall(apiName, duration, status) method
    - Implement logCacheOperation(operation, key, timestamp) method
    - Implement logScoringComputation(country, parameters) method
    - Implement logFailure(apiName, error, country) method
    - Implement logCompletion(processingTime, countryCount) method
    - Use winston or similar structured logging library
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6_
  
  - [ ]* 11.2 Write property test for Comprehensive Logging
    - **Property 15: Comprehensive Logging**
    - **Validates: Requirements 1.6, 4.6, 5.3, 8.5, 11.1-11.6**
    - Test that all required log entries are generated for any analysis request
    - Use fast-check to generate arbitrary AnalysisRequest objects
    - Verify log entries for API calls, cache operations, scoring, failures, completion
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6_

- [ ] 12. Implement Intelligence Engine Orchestrator
  - [ ] 12.1 Create IntelligenceEngine class with analyze method
    - Integrate RequestValidator for input validation
    - Integrate APIAggregator for data fetching (with cache integration)
    - Integrate ScoringModule for score computation per country
    - Integrate RankingEngine for country ranking
    - Integrate ObservabilityLogger for all logging operations
    - Assemble AnalysisResponse with results and metadata (processing time, cache hits/misses, failures)
    - Handle complete failure case (exclude countries with no data)
    - _Requirements: 5.1, 5.2, 5.5, 6.1, 7.1_
  
  - [ ]* 12.2 Write property test for Partial Failure Resilience
    - **Property 7: Partial Failure Resilience**
    - **Validates: Requirements 5.1, 5.2, 5.6**
    - Test that partial API failures return HTTP 200 with available data and failure metadata
    - Use fast-check to generate scenarios with mixed API success/failure
    - _Requirements: 12.5_
  
  - [ ]* 12.3 Write property test for Complete Failure Exclusion
    - **Property 8: Complete Failure Exclusion**
    - **Validates: Requirements 5.5**
    - Test that countries with all API failures are excluded from results
    - Use fast-check to generate scenarios where all APIs fail for specific countries
    - _Requirements: 5.5_
  
  - [ ]* 12.4 Write property test for Response Structure Completeness
    - **Property 9: Response Structure Completeness**
    - **Validates: Requirements 6.2, 6.4, 6.5, 7.6**
    - Test that each ranked country includes all 3 scores, weighted score, reasoning, and rank
    - Use fast-check to generate arbitrary analysis scenarios
    - _Requirements: 6.4, 6.5, 7.6_
  
  - [ ]* 12.5 Write property test for Cache Metadata Completeness
    - **Property 14: Cache Metadata Completeness**
    - **Validates: Requirements 4.3, 4.4, 5.4**
    - Test that response metadata includes cache hit count, miss count, and failure info
    - Use fast-check to generate arbitrary analysis scenarios
    - _Requirements: 4.3, 4.4, 5.4_

- [ ] 13. Implement API Gateway and Express routes
  - [ ] 13.1 Create Express server with /api/analyze POST endpoint
    - Set up Express app with JSON body parsing
    - Create POST /api/analyze route handler
    - Integrate IntelligenceEngine.analyze method
    - Return HTTP 200 with results on success
    - Return HTTP 400 with error details on validation failure
    - Return HTTP 500 on internal processing errors
    - Add CORS middleware for frontend integration
    - _Requirements: 7.1, 7.5, 7.6_
  
  - [ ]* 13.2 Write integration tests for API endpoint
    - Test successful analysis request (HTTP 200 with complete results)
    - Test validation error (HTTP 400 with error message)
    - Test partial failure scenario (HTTP 200 with partial data and warnings)
    - Test complete failure scenario (HTTP 200 with excluded countries)
    - Use supertest for HTTP testing
    - _Requirements: 5.6, 7.1, 7.5, 7.6_

- [ ] 14. Checkpoint - Ensure backend is fully functional
  - Run all backend tests (unit, property, integration)
  - Verify all 16 property tests pass with 100+ iterations
  - Test API endpoint manually with Postman or curl
  - Verify logging output is complete and structured
  - Ask the user if questions arise

- [ ] 15. Implement Frontend Dashboard - Project setup
  - [ ] 15.1 Initialize React project with TypeScript
    - Create React app with TypeScript template
    - Install UI library (Material-UI, Ant Design, or Tailwind CSS)
    - Install axios for HTTP requests
    - Create directory structure: `/src/components`, `/src/services`, `/src/types`
    - Define TypeScript interfaces matching backend response types
    - _Requirements: 9.1, 9.2, 9.3_

- [ ] 16. Implement Frontend Dashboard - Input form
  - [ ] 16.1 Create CountrySelector component
    - Multi-select dropdown for country selection
    - Validation: minimum 3 countries required
    - Display validation error if <3 countries selected
    - _Requirements: 9.1_
  
  - [ ] 16.2 Create PreferencesForm component
    - Radio buttons or dropdown for risk tolerance (Low, Moderate, High)
    - Radio buttons or dropdown for duration (Short-term, Long-term)
    - Submit button to trigger analysis
    - _Requirements: 9.2, 9.3_
  
  - [ ] 16.3 Create loading state component
    - Display spinner or progress indicator during API request
    - Disable form inputs while loading
    - _Requirements: 9.4_

- [ ] 17. Implement Frontend Dashboard - Results display
  - [ ] 17.1 Create ResultsTable component
    - Display countries in ranked order
    - Show rank number, country name, weighted score
    - Show breakdown of all 3 intelligence scores (Travel Risk, Health Infrastructure, Environmental Stability)
    - Display reasoning summary for each country
    - _Requirements: 9.5, 9.6_
  
  - [ ] 17.2 Create WarningBanner component
    - Display warning when partial data is returned
    - Show which data sources failed
    - Style as non-blocking informational banner
    - _Requirements: 9.7_
  
  - [ ] 17.3 Create ErrorDisplay component
    - Display error message on network errors
    - Display validation errors from backend
    - Provide retry button
    - _Requirements: 9.8_

- [ ] 18. Implement Frontend Dashboard - API integration
  - [ ] 18.1 Create AnalysisService with API client
    - Implement analyzeCountries method that POSTs to /api/analyze
    - Handle HTTP 200 success responses
    - Handle HTTP 400 validation errors
    - Handle HTTP 500 server errors
    - Handle network errors (timeout, connection refused)
    - Parse response JSON into TypeScript types
    - _Requirements: 7.1, 9.8_
  
  - [ ] 18.2 Wire components together in main App component
    - Manage form state (countries, risk tolerance, duration)
    - Manage loading state
    - Manage results state
    - Manage error state
    - Call AnalysisService on form submission
    - Render appropriate component based on state (form, loading, results, error)
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8_

- [ ] 19. Performance testing and optimization
  - [ ]* 19.1 Write property test for Performance Bounds
    - **Property 16: Performance Bounds**
    - **Validates: Requirements 8.1, 8.2**
    - Test that 3-country analysis completes in <2s with cache misses, <200ms with cache hits
    - Use mocked APIs with realistic latencies (100-500ms)
    - _Requirements: 8.1, 8.2_
  
  - [ ]* 19.2 Run performance benchmarks
    - Test response time with 3 countries (cache miss scenario)
    - Test response time with 3 countries (cache hit scenario)
    - Test response time with 10 countries
    - Test concurrent request handling (5 simultaneous requests)
    - Identify and optimize bottlenecks if performance requirements not met
    - _Requirements: 8.1, 8.2, 8.5_

- [ ] 20. Final integration and deployment preparation
  - [ ] 20.1 Create environment configuration
    - Create .env.example with required API keys (OPENWEATHER_API_KEY, WAQI_TOKEN)
    - Document environment setup in README
    - Add environment validation on server startup
    - _Requirements: 1.3, 1.4_
  
  - [ ] 20.2 Create startup scripts
    - Add npm scripts for backend: `npm run dev`, `npm run build`, `npm start`
    - Add npm scripts for frontend: `npm run dev`, `npm run build`
    - Add npm script for running all tests: `npm test`
    - Add npm script for running property tests only: `npm run test:properties`
    - _Requirements: 10.6_
  
  - [ ] 20.3 Write README with setup and usage instructions
    - Document system architecture and components
    - Document API endpoint specification
    - Document environment setup
    - Document how to run backend and frontend
    - Document how to run tests
    - Include example API request/response
    - _Requirements: 7.1, 9.1, 9.2, 9.3_

- [ ] 21. Final checkpoint - End-to-end validation
  - Run complete test suite (all unit, property, and integration tests)
  - Verify all 16 property tests pass with 100+ iterations
  - Test full system manually: submit analysis request from frontend, verify results display correctly
  - Test partial failure scenario: disable one API, verify system continues with warning
  - Test cache behavior: submit same request twice, verify second request is faster
  - Verify all logging output is present and structured
  - Ask the user if questions arise or if ready for demo

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP delivery
- Property tests validate universal correctness properties across all inputs (100+ iterations each)
- Unit tests validate specific examples and edge cases
- Backend modules (tasks 2-12) can be developed in parallel after task 1 completes
- Frontend components (tasks 15-18) can be developed in parallel with backend
- Checkpoints (tasks 6, 14, 21) ensure incremental validation before proceeding
- Each task references specific requirements for traceability
- All 16 correctness properties from the design document are covered in property test sub-tasks
- Integration tests ensure components work together correctly
- Performance testing validates sub-2-second response time requirement
