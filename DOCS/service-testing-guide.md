# Service Testing Guide

## Testing Individual Services to Isolate Issues

Let's create separate test endpoints for each service and a client-side component to test them individually. This approach will help us identify exactly which service is causing problems in the health check API.

## How to Use the Service Tester

1. **Deploy the Updated Code**: Deploy these changes to your production environment.
2. **Access the Service Tester**: Navigate to `/dashboard` in your application to access the Service Tester component.
3. **Test Each Service Individually**:
   - Click on each service tab (Pinecone, Supabase, OpenAI)
   - Click the "Test Connection" button for each service
   - Review the results to see which services are working and which are failing

4. **Test All Services**: Use the "Test All Services" button to check all services at once.
5. **Check the API Endpoints Directly**:
   You can also directly access each test endpoint in your browser or with curl:

\`\`\`
https://www.vector-rag.com/api/test-pinecone
https://www.vector-rag.com/api/test-supabase
https://www.vector-rag.com/api/test-openai
https://www.vector-rag.com/api/health-simple
\`\`\`

## What to Look For

1. **Connection Errors**: Look for specific connection errors in the test results.
2. **Timeout Issues**: Check if any services are timing out.
3. **Environment Variable Problems**: Verify that all required environment variables are set correctly.
4. **Service-Specific Issues**:
   - **Pinecone**: Check if the index exists and is accessible
   - **Supabase**: Verify database connection and table access
   - **OpenAI**: Confirm API key validity and rate limits

5. **Runtime Compatibility**: Note which runtime (edge or nodejs) works for each service.

## Next Steps Based on Results

- If **all services fail**, check your environment variables and network connectivity.
- If **only Pinecone fails**, focus on Pinecone-specific issues (API key, index name, etc.).
- If **only Supabase fails**, check your Supabase credentials and database setup.
- If **only OpenAI fails**, verify your OpenAI API key and rate limits.

This isolated testing approach will help you pinpoint exactly which service is causing issues in your health check API, allowing you to focus your troubleshooting efforts more effectively.
