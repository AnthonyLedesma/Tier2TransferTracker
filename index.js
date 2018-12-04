/*
|--------------------------------------------------------------------------
| SWATTT - SWAT Transfer Tracker
|--------------------------------------------------------------------------
|
| Used By Tier 2 Swat Agents To Capture Transfer Data.
*/
; (SWATTT = ($, DOMPurify) => {
    // Whole-script strict mode syntax
    'use strict';

    let demeanor;
    let understanding;
    let domains;
    let guid;
    let attributes;
    let training;
    let ticketCreated = "` No Ticket Created `";
    let attrArray = [];
    let oppsArray = [];
    let resultString = '';
    let timeoutModule;
    const successString = "Success. Ready To Submit To Slack!";
    const successSlack = "Submitted To Slack!";
    const domainsRegex = /([a-zA-Z0-9-_]+\.)*[a-zA-Z0-9][a-zA-Z0-9-_]+\.[a-zA-Z]{2,11}?$/i //works against a list of 20k valid domains

    /*
    |--------------------------------------------------------------------------
    | Click listener on the parse button handles form inputs logic
    | Sanitize the inputs and perform error checking then format values for slack
    | Enable Slack button if a valid form has ben filled and no error has occured.
    |--------------------------------------------------------------------------
    */

    $("#parseButton").click(function () {
        domains = DOMPurify.sanitize($('#domainsBox').val().toLowerCase().trim());
        guid = DOMPurify.sanitize($('#guidBox').val().toLowerCase().trim());
        parseAttrs();
        parseOpps();
        if (errorCheck() !== false) { handleError(errorCheck()); return; }

        formatValues();


        setOutputText();

        //display final output for the user and enable slack button.
        finalizeResults();

        /*
        |--------------------------------------------------------------------------
        | Function Declaration Block. 
        |--------------------------------------------------------------------------
        */



        //finalizeResults()
        function finalizeResults() {
            $("#SubmitSlack").removeAttr('disabled');
            $("#errorPTag").removeAttr("hidden").removeClass('uk-alert-danger').addClass('uk-alert-success');
            $("#errorP").html(successString);
            $("#parseButton").attr('disabled', 'disabled');

        }

        //Parse Call Attributes for attrArray
        function parseAttrs() {
            attrArray = [];
            if ($("#OOS").is(":checked")) { attrArray.push(" Inquiry Out Of Scope / Scope Enforcement "); }
            if ($("#multiple").is(":checked")) { attrArray.push(" Issue Persisting After Multiple Calls "); }
            if ($("#misinform").is(":checked")) { attrArray.push(" Caused By Customer Being Misinformed/Sold "); }
            if ($("#expectations").is(":checked")) { attrArray.push(" Improper Expecations Set For Service Or Product "); }
            if ($('#common').is(":checked")) { attrArray.push(" Training Needed For Common Issue. See Note. "); }
            if ($("#goodTransfer").is(":checked")) { attrArray = []; attrArray.push(" Good Transfer "); }
        };
        //Parse trainining opps
        function parseOpps() {
            oppsArray = [];
            if ($("#tribal").is(":checked")) { oppsArray.push(" Agent Training For Tribal Knowledge/Use Of Resources "); }
            if ($("#standardProc").is(":checked")) { oppsArray.push(" Standard Procedure For All Agents (Scope Of Support) "); }
            if ($("#contentDiscovery").is(":checked")) { oppsArray.push(" Agent Did Not Discover That Issue Is Content Related "); }
            if ($("#NoTraining").is(":checked")) { oppsArray = []; oppsArray.push(" No Training Needed "); }
        };
        //Check for errors before enabling slack submission
        function errorCheck() {
            if (domains.trim() === "" && domains.toUpperCase().trim() !== "N/A") { return "Enter a valid domain"; }
            if (domains.toUpperCase().trim() === "N/A" && !$('#domainsNA').is(":checked")) { return "Must enter domain OR guid"; }
            if (guid.toUpperCase().trim() === "N/A" && !$('#guidNA').is(":checked")) { return "Must enter domain OR guid"; }
            if (guid.trim() === "" && guid.toUpperCase().trim() !== "N/A") { return "Enter a valid guid"; }
            if (domainsRegex.exec(domains.trim()) === null && domains.toUpperCase().trim() !== "N/A") { return "Enter a valid domain"; }
            if (!$("input[name='radioDemeanor']:checked").val()) { return "Please select a call demeanor"; }
            if (!$("input[name='radioUnderstanding']:checked").val()) { return "Please select agent understanding"; }
            if (!$("input[name='CallAttributes']:checked").val()) { return "Please select call attribute(s)"; }
            if (!$("input[name='TrainingOpp']:checked").val()) { return "Please select a training option"; }
            return false;
        }
        //Adds backticks ` for formatting in Slack
        function formatValues() {
            domains = "` " + domains + " `";
            guid = "` " + guid + " `";
            attributes = "`" + attrArray + "`";
            training = "`" + oppsArray + "`";
        }

        //received error string
        function handleError(error) {
            if (error !== false) {
                $("#errorPTag").removeAttr("hidden");
                $("#errorP").html(error);
                timeoutModule = setTimeout(() => {
                    $("#errorPTag").attr('hidden', 'hidden');
                }, 8000);
            }
        }
    })

    /*
    |--------------------------------------------------------------------------
    | Event Handlers and form reset function
    | Set demeanor and understanding variables
    | Submit to Slack button
    |--------------------------------------------------------------------------
    | For slack configuration please view the API documentation for Incoming Webhooks
    | https://godaddy.slack.com/apps/A0F7XDUAZ-incoming-webhooks?page=1
    */

    $('#resetButton').click(function () {
        handleReset();
    })

    $('#domainsNA').on('change', function () {
        if ($('#domainsNA').is(':checked')) {
            $("#domainsBox").val("N/A").prop('disabled', true);
            $("#guidNA").prop('disabled', true);
            $('#mustDomain').attr('hidden', 'hidden');
            if ($("#guidBox").val().trim() === "") {
                $('#mustGuid').removeAttr('hidden');
            } else {
                $('#mustGuid').attr('hidden', 'hidden');
            }
        } else if (!$('#domainsNA').is(':checked')) {
            $("#domainsBox").val("").prop('disabled', false);
            $("#guidNA").prop('disabled', false);
            $('#mustGuid').attr('hidden', 'hidden');
        }
    });
    //set guidNA N/A checkbox change checks
    $('#guidNA').on('change', function () {
        if ($('#guidNA').is(':checked')) {
            $("#guidBox").val("N/A").prop('disabled', true);
            $("#domainsNA").prop('disabled', true);
            $('#mustGuid').attr('hidden', 'hidden');
            if ($("#domainsBox").val().trim() === "") {
                $('#mustDomain').removeAttr('hidden');
            } else {
                $('#mustDomain').attr('hidden', 'hidden');
            }
        }
        else if (!$('#guidNA').is(':checked')) {
            $("#guidBox").val("").prop('disabled', false);
            $("#domainsNA").prop('disabled', false);
            $('#mustDomain').attr('hidden', 'hidden');
        }
    });

    $('#domainsBox').on('input', function () {
        if ($('#mustDomain').is(":visible") && $("#domainsBox").val().trim() !== "") {
            $('#mustDomain').attr('hidden', 'hidden');
        } else if ($('#mustDomain').is(":hidden") && $("#domainsBox").val().trim() === "") {
            $('#mustDomain').removeAttr('hidden');
        }
    })

    $('#guidBox').on('input', function () {
        if ($('#mustGuid').is(":visible") && $("#guidBox").val().trim() !== "") {
            $('#mustGuid').attr('hidden', 'hidden');
        } else if ($('#mustGuid').is(":hidden") && $("#guidBox").val().trim() === "") {
            $('#mustGuid').removeAttr('hidden');
        }
    })
    //Check if good transfer
    $('#goodTransfer').on('change', function () {
        $("input[name='CallAttributes']").not(this).prop('checked', false);
    });
    //Check if no training selected
    $('#NoTraining').on('change', function () {
        $("input[name='TrainingOpp']").not(this).prop('checked', false);
    });

    //Check if no training selected
    $("input[name='TrainingOpp']").not($('#NoTraining')).on('change', function () {
        if ($('#NoTraining:checked')) { $('#NoTraining').prop('checked', false); }
    });
    //Check if good transfer
    $("input[name='CallAttributes']").not($('#goodTransfer')).on('change', function () {
        if ($('#goodTransfer:checked')) { $('#goodTransfer').prop('checked', false); }
    });

    //Set demeanor values
    $("input[name='radioDemeanor']").click(function () {
        if ($("#radioPositive").is(":checked")) {
            demeanor = "` Positive `";
        } else if ($("#radioNeutral").is(":checked")) {
            demeanor = "` Neutral `";
        } else if ($("#radioNegative").is(":checked")) {
            demeanor = "` Negative `";
        }
    });
    //set understanding values
    $("input[name='radioUnderstanding']").click(function () {
        if ($("#radioYes").is(":checked")) {
            understanding = "` Full Understanding `";
        } else if ($("#radioNo").is(":checked")) {
            understanding = "` Limited Or No Explaination `";
        } else if ($("#radioMisUnder").is(":checked")) {
            understanding = "` False Understanding `";
        }
    });
    //handle ticket variable;
    $('#ticketCheckbox').click(function () {
        if ($("#ticketCheckbox").is(":checked")) {
            ticketCreated = "` Ticket Created After Transfer `";
            console.log(`ticket created value is : ${ticketCreated} and the value of the checkbox is ${$("#ticketCheckbox").is(":checked")}`);
        } else if (!$("#ticketCheckbox").is(":checked")) {
            ticketCreated = "` No Ticket Created `";
            console.log(`ticket created value is : ${ticketCreated} and the value of the checkbox is ${$("#ticketCheckbox").is(":checked")}`);
        }
    });



    /* Event listener for the Slack Submission Button. 
        Button should only allow click when content has been confirmed correct.  */
    $("#SubmitSlack").click(function () {
        let url = "APIURLGOESHERE";
        let text = resultString;
        $.ajax({ data: 'payload=' + JSON.stringify({ "text": text }), dataType: 'json', processData: false, type: 'POST', url: url });
        $("#SubmitSlack").attr('disabled', 'disabled');
        $("#errorPTag").removeAttr('hidden').removeClass('uk-alert-success').addClass('uk-alert-primary');
        $("#errorP").html(successSlack);
        setTimeout(() => {
            $("#errorPTag").attr('hidden', 'hidden').removeClass('uk-alert-primary').addClass('uk-alert-danger')
            $("#errorP").html('');
            handleReset();
        }, 15000);
    });// End of event handlers

    //reset form values and variables
    function handleReset() {
        clearTimeout(timeoutModule);
        $("input[type='checkbox']").prop('checked', false);
        $("input[type='radio']").prop('checked', false);
        $("input[type='text']").val('').attr('disabled', false);
        $("#SubmitSlack").attr('disabled', 'disabled');
        $("input[name='checkboxNA']").prop('checked', false).removeAttr('disabled');
        $('#errorPTag').removeClass().attr('hidden', 'hidden').attr('class', 'uk-alert-danger uk-text-center uk-text-capitalize uk-margin-remove-vertical uk-margin-left uk-alert')
        $('#mustDomain').attr('hidden', 'hidden');
        $('#mustGuid').attr('hidden', 'hidden');
        $("#parseButton").removeAttr('disabled');
        $('input[type=checkbox]:disabled').removeAttr('disabled');
        $("#errorP").html('');
        demeanor = '';
        understanding = '';
        domains = '';
        guid = '';
        attributes = '';
        training = '';
        ticketCreated = "` No Ticket Created `";;
        attrArray = [];
        oppsArray = [];
    }

    function setOutputText() {
        //Without formatting backticks ` are not inserted into text. Important for slack formatting.
        resultString = `#### SWAT Transfer Tracker ####
Domain: ${domains}
GUID: ${guid}
Issue Was Explained: ${understanding}
Call Demeanor: ${demeanor}
Call Attributes: ${attributes}
Training Opportunities: ${training}
Ticket Created: ${ticketCreated}`;
    }

})($, DOMPurify);