## Key Challenges

1. Scrapping and fetching real time data without using of api was new but with lot of research, I was able to scrap google finanace data
2. Yahoo finance scrapper was easy to find as it was complete github repo where i was able to get proper technical docs and code for using.
3. For Google scrapping logic, i utilize chat gpt as it was a bit confusing thing but after researching i was able to understand.



## Key Solutions
1. Merged the results from both yahoo and google finance into one to get integrated result 
- api - Check /app/api/finance/route.ts
- functional logic - /app/src/utils/financialApi.ts

2. Implement Ag grid table view using ag-grid-commumity and ag-grid-enterprice packages - This have huge advantage over other tables libraries as having real-time updates, handle filtering logic with just one single status, Group By feature pagination power etc

3. Implement parallel processing of apis as we are implementing scrapping of individual stock, so calling synchronous was taking too much time(check my second commit). Solves the issue by using Promise.all (parallel processing) - increase efficiency to 50%

4. using setInterval to fetching and scrapping data after every 15 seconds made it super realtime and all is done with asynchronous processing to avoid dependency.

5. Data transformation is done in next api as per requirements (present in /app/src/utils/dataTransformation.ts)

