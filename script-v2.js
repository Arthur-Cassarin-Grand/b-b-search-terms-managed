/**
* AUTHOR : Arthur CASSARIN-GRAND
* E-mail : arthur.cassarin@gmail.com
* LICENSE : GNU Lesser General Public License v3.0
* USAGE : You can use, copy and modify this script for both personal and commercial purposes under the same license.
* You still MUST to write original author's name in the code.
*
* SEARCH TERMS ANALYZER FOR MANAGED CAMPAIGNS BUILDER
* This script show in a sheet search terms that are not targeted by an exact keyword in your account.
* For each keyword, a relevance score is calculated to easily see which ones deserves a dedicated ad group in a managed campaign.
*
* Version: 0.1
* CHANGELOG
* 0.1 - 05/12/2021 - Bêta
**/

/* ========================================================================================================== */
/* /!\ This script ignores search terms that are related to exact match keywords (with no close variants) /!\ */
/* ========================================================================================================== */

spreadsheetUrl = "YOUR_SPREADSHEET_URL"; // MODIFY THIS

/* ==== Min-Max settings (values MUST be filled) ==== */
lastNDays = 180 // Select date range (e.g. 90, for 90 last days until yesterday)
minImpressions = 10 // (>=) Minimum amount of impressions (format : 100)
minClick = 5 // (>=) Minimum amount of clicks (format : 100)
minConversions = 1.0 // (>=) Minimum amount of conversions (format : 100.5 or 100.0)
minConversionValue = 0.0 // (>=) Minimum conversion value (format : 100.5 or 100.0)
maxCPA = 9999.0 // (<=) Most per conversion (format : 100.5 or 100.0)
minCost = 0.1 // (>=) Minimum cost (format : 100.5 or 100.0)
currency = "€" // Currency written after cost value
suffixForManagedCampaigns = " - Managed" // Default name for suggested new managed campaign
defaultManagedMatchType = "Exact" // If you plan to create a managed campaign with only phrase keywords inside, change this value to "Phrase"

/* 
Relevance score will be based on conversion value if possible, rather than conversion numbers, to consider firstly the ROI rather than conversion volume. 
If your Google Ads e-commerce tracking is not well setup or if your conversion values are arbitrary (for leads qualifying purposes, in B2B for example) and don't want to consider them,
set this variable to false.
*/
prioritizeConversionValue = true // <- this one

/* ================================================= */

function getAdWordsFormattedDate(d, format) {
    var date = new Date();
    date.setDate(date.getDate() - d);
    return Utilities.formatDate(date,AdsApp.currentAccount().getTimeZone(),format);
}

function main() {
    var spreadsheet = SpreadsheetApp.openByUrl(spreadsheetUrl);
    var sheet = spreadsheet.setActiveSheet(spreadsheet.getSheets()[0]);
    // Clear sheet
    if (sheet.getFilter()) {
        sheet.getFilter().remove();
    }
    sheet.clear();
    var dateRange = getAdWordsFormattedDate(lastNDays, 'yyyyMMdd') + ',' + getAdWordsFormattedDate(1, 'yyyyMMdd');
    
    // Extract Search Terms Report
    var reportAccountStats = AdsApp.report(
        "SELECT Clicks,Impressions,CostPerConversion,Conversions,ConversionValue " +
        " FROM ACCOUNT_PERFORMANCE_REPORT " +
        " DURING " + dateRange);

    var ACrows = reportAccountStats.rows();

    // Account metrics for relevance score
    while (ACrows.hasNext()) {
        var row = ACrows.next();
        var totalConversions = parseFloat(row['Conversions']);
        var totalClicks = parseFloat(row['Clicks']);
        var totalImpressions = parseFloat(row['Impressions']);
        var totalConversionsValue = parseFloat(row['ConversionValue']);
    }

    // Extract Search Terms Report
    var reportSearchTerms = AdsApp.report(
        "SELECT Query,Clicks,Cost,Impressions,Ctr,ConversionRate,CostPerConversion,Conversions,ConversionValue,CampaignName,AdGroupName,QueryMatchTypeWithVariant,TopImpressionPercentage " +
        " FROM SEARCH_QUERY_PERFORMANCE_REPORT " +
        " DURING " + dateRange);

    var STrows = reportSearchTerms.rows();

    // Create header line
    sheet.appendRow([
        'Relevance score',
        'New Campaign',
        'New Ad Group',
        'Query',
        'New Match type',
        'Current Match Type',
        'Conv.', 
        'Conv. value', 
        'Cost per conv.',
        'Conv. rate',
        'Cost',
        'Clicks',
        'Impressions',
        'CTR',
        'Top impression %',
        'Campaign',
        'Ad group',
    ]);

    var lineList = [];
    var nResults = 0;

    // Read Search Terms report
    while (STrows.hasNext()) {
        var row = STrows.next();

        var line = {
            query: row['Query'],
            clicks: row['Clicks'],
            impressions: row['Impressions'],
            cost: row['Cost'],
            ctr: row['Ctr'],
            conversionRate: row['ConversionRate'],
            conversionValue: row['ConversionValue'],
            costPerConversion: row['CostPerConversion'],
            conversions: row['Conversions'],
            campaignName: row['CampaignName'],
            adGroupName: row['AdGroupName'],
            matchTypeWithVariant: row['QueryMatchTypeWithVariant'],
            topImpressionPercentage: row['TopImpressionPercentage']
        }

        // Ignore search terms that don't respect filters
        var match = true;
        if (line.matchTypeWithVariant == "exact" || line.impressions < minImpressions || line.clicks < minClick || line.conversions < minConversions || line.conversionValue < minConversionValue || line.costPerConversion > maxCPA || line.cost < minCost) 
        { match = false; }

        if (match) {
            // Get relevance score
            var relevanceScore = 0;
            if (line.conversions > 0 && line.clicks > 0 && line.impressions > 0) {
                var percentConversions = (line.conversions / totalConversions)*100;
                var percentClicks = (line.clicks / totalClicks)*100;
                var percentImpressions = (line.impressions / totalImpressions)*100;
                var percentTopImpression = parseFloat(line.topImpressionPercentage)*100;
                var considerConversionValue = false;
                if (line.conversionValue > totalConversionsValue) {considerConversionValue = true;}
                if (considerConversionValue || prioritizeConversionValue == false) {
                    var percentConversionsValue = (line.conversionValue / totalConversionsValue)*100;
                    relevanceScore = percentConversionsValue + percentImpressions - percentClicks - percentTopImpression;
                } else {
                    relevanceScore = percentConversions + percentImpressions - percentClicks - percentTopImpression;
                }
            }

            lineList.push([
                relevanceScore.toFixed(0),
                line.campaignName + suffixForManagedCampaigns,
                line.query, 
                line.query,
                defaultManagedMatchType,
                line.matchTypeWithVariant,
                line.conversions,
                line.conversionValue + ' ' + currency,
                line.costPerConversion + ' ' + currency,
                line.conversionRate,
                line.cost + ' ' + currency,
                line.clicks,
                line.impressions,
                line.ctr,
                (line.topImpressionPercentage)*100 + '%',
                line.campaignName,
                line.adGroupName
            ]);
            nResults++;
        }
    }

    // Write data in Spreadsheet
    if (nResults > 0) {
        var lastRow = sheet.getLastRow();
        sheet.getRange(lastRow + 1,1,lineList.length, lineList[0].length).setValues(lineList);
    } else {
        sheet.appendRow("No result with current settings. Check filters in the mix-max part at the start of the script.");
    }

    // Color formatted rows for campaign builder
    sheet.getRange("B:E").setBackground("#ffe6e6");

    // Align left (to avoid weird right aligned format)
    sheet.getRange("A:Q").setHorizontalAlignment("left");

    // Add filter
    sheet.getRange("A1:Q").createFilter();
    sheet.sort(1, false)
}