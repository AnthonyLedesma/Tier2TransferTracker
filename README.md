# JS-Text-Parser---Escalation-and-Formatting
Tracker used to log data from calls transferred to Tier 2 support.

JS File does not have real API URL for slack.


![Call Tracker](/Screenshot.png?raw=true "Call Tracker")


## Version 1.0 for **Tier 2 Call Tracker**

### Features:
+ Tracks Common Call Attributes And Training Opportunities.
+ Identify Caller Demeanor As Well As Knowledge Hand-off.
+ Required Basic Inputs Ensure Data Consistency.
+ Error Message Will Indicate Missing Content.


### Integration Into Confluence - Requirements and Notes
+ In Confluence we have the option to import the javascript dependency and link to it directly. (Causes email notifications with updates)
+ Alternitively we can embed <script type='text/javascript'> </script> into the HTML macro to include all code on-page.
+ Must also strip out document declaration, footer, and header from Git hosted index.html version as these are over-ridden/conflict on Confluence.
+ Near the top of the index.html file is code to emport UI-Kit stylesheets from CDN. These should be commented out when importing on Confluence.