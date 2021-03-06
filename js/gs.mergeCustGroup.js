/**
 * For Merging two customer groups
 */
var gs = gs || {};

gs.mergecustomer = (function(){
    var baseBillNo, otherBillNo, rawResponse = [], fetchCounter = 0;
    var sel = {
        baseBillNo: '.base-bill-no',
        otherBillNo: '.other-bill-no',
        getBillDetails: '.get-bill-details',
        doMerge: '.do-merge'
    };
    function init(){
        bindEvents();
    }
    function bindEvents(){
        $(sel.getBillDetails).off().on('click', function(){
            baseBillNo = $(sel.baseBillNo).val().trim();
            otherBillNo = $(sel.otherBillNo).val().trim();
            if(baseBillNo == '' || otherBillNo == '')
                return;
            if(baseBillNo == otherBillNo){
                showErrorMessage('Ids could not be same. Please provide different ID\'s');
                return;
            }
            getDetails();
        });        
    }
    function bindSubmitEvent(){
        $(sel.doMerge).off().on('click', function(e){
            fetchCounter = 0;
            var newData = fetchNewDetails();
            merge(newData);
        });
    }
    function getDetails(){
        var obj = {
            aQuery: "SELECT * FROM dev.pledgebook where custid = '"+baseBillNo+"'"
        }
        var callBackObj = gs.api.getCallbackObject();
		var request = gs.api.getRequestData('../php/executequery.php', obj , 'POST');
		callBackObj.bind('api_response', function(event, response){
            fetchCounter++;
            response = JSON.parse(response)[0];
            rawResponse['baseBillDetails'] = response;
            onFetchComplete();
		});
		gs.api.call(request, callBackObj);

        var obj2 = {
            aQuery: "SELECT * FROM dev.pledgebook where custid = '"+otherBillNo+"'"
        }
        var callBackOb = gs.api.getCallbackObject();
		var request = gs.api.getRequestData('../php/executequery.php', obj2 , 'POST');
		callBackOb.bind('api_response', function(event, response){
			fetchCounter++;
            response = JSON.parse(response)[0];
            rawResponse['otherBillDetails'] = response;
            onFetchComplete();
		});
		gs.api.call(request, callBackOb);
    }
    function onFetchComplete(){
        if(fetchCounter < 2)
            return;
        var errorMsgIds = [];
        if(_.isUndefined(rawResponse.baseBillDetails))
            errorMsgIds.push(baseBillNo);
        if(_.isUndefined(rawResponse.otherBillDetails))
            errorMsgIds.push(otherBillNo);
        if(errorMsgIds.length != 0){
            showErrorMessage(errorMsgIds,'specialUsecase');
        }else{
            var mergedResponse = mergeResponseData();
            renderDetails(mergedResponse);
            bindSubmitEvent();
        }
    }
    function mergeResponseData(){
        var parsedData;
        try{
            parsedData = {
                b_cname: rawResponse.baseBillDetails.cname,
                o_cname: rawResponse.otherBillDetails.cname,
                b_fgname: rawResponse.baseBillDetails.fgname,
                o_fgname: rawResponse.otherBillDetails.fgname,
                b_address: rawResponse.baseBillDetails.address,
                o_address: rawResponse.otherBillDetails.address,
                b_address2: rawResponse.baseBillDetails.address2,
                o_address2: rawResponse.otherBillDetails.address2,
                b_place: rawResponse.baseBillDetails.place,
                o_place: rawResponse.otherBillDetails.place,
                b_pincode: rawResponse.baseBillDetails.pincode,
                o_pincode: rawResponse.otherBillDetails.pincode,
                b_mobile: rawResponse.baseBillDetails.mobile,
                o_mobile: rawResponse.otherBillDetails.mobile            
            }
        }catch(e){
            console.error('Error in mergeResponseData function... Please check it');
        }
        return parsedData;
    }
    function renderDetails(myData){
        var property = {
            myData: myData
        }
        var template = _.template(template_htmlstr_merge_cust_group_sub, property);
        $('.view-panel').html(template);
    }
    function fetchNewDetails(){
        var newData = {};
        newData.baseBillNo = baseBillNo;
        newData.otherBillNo = otherBillNo;        
        newData.cname = $('input[name="cname"]:checked').val();
        newData.gname = $('input[name="gname"]:checked').val();
        newData.addr = $('input[name="addr"]:checked').val();
        newData.addr2 = $('input[name="addr2"]:checked').val();
        newData.place = $('input[name="place"]:checked').val();
        newData.pincode = $('input[name="pin"]:checked').val();
        newData.mobile = $('input[name="mobile"]:checked').val();
        return newData;
    }
    function merge(newData){
        var obj = {};
        obj.multiQuery = 'true';
        obj.aQuery = 'SET SQL_SAFE_UPDATES = 0;';
        obj.aQuery += 'update dev.pledgebook set custid="'+newData.baseBillNo+'",cname="'+newData.cname+'", fgname="'+newData.gname+'", address="'+newData.addr+'", address2="'+newData.addr2+'",place="'+newData.place+'", pincode="'+newData.pincode+'", mobile="'+newData.mobile+'" where custid="'+newData.baseBillNo+'";';
        obj.aQuery += 'update dev.pledgebook set custid="'+newData.baseBillNo+'",cname="'+newData.cname+'", fgname="'+newData.gname+'", address="'+newData.addr+'", address2="'+newData.addr2+'",place="'+newData.place+'", pincode="'+newData.pincode+'", mobile="'+newData.mobile+'" where custid="'+newData.otherBillNo+'";';
        obj.aQuery += 'SET SQL_SAFE_UPDATES = 1;';
        var callBackOb = gs.api.getCallbackObject();
		var request = gs.api.getRequestData('../php/executequery.php', obj , 'POST');
		callBackOb.bind('api_response', function(event, response){
            var title, msg, onHiddenCallBack;            
            var response = JSON.parse(response);
            if(!_.isUndefined(response[0]) && response[0].status == true){
                title = 'Success';
                msg = '<p class="greenColor boldFont">Customer Detail updated Successfully !<p>';
                onHiddenCallBack = clearFields;
                baseBillNo = '';
                otherBillNo = '';
            }else{
                title = 'Error';
                msg = '<p class="red-color boldFont">Error in updating the records...<p>';
            }
            gs.popup.init(
                {
                 title: title,
                 desc: msg ,
                 dismissBtnText: 'Ok',
                 enableHtml: true,
                 onHiddenCallback: onHiddenCallBack
                });
		});
		gs.api.call(request, callBackOb);
    }
    function clearFields(){
        $(sel.baseBillNo).val('');
        $(sel.otherBillNo).val('');
        $('.view-panel').html('');
    }

    function showErrorMessage(errorMsg, usecase){
        if(!_.isUndefined(usecase) && usecase == 'specialUsecase'){
            var errorMsgIds = errorMsg;
            var custId1 = '', custId2 = '';
            if(!_.isUndefined(errorMsgIds[0]))
                custId1 = errorMsgIds[0];
            if(!_.isUndefined(errorMsgIds[1]))
                custId2 = ' and ' + errorMsgIds[1];
            gs.popup.init(
                    {
                        title: 'Does not Exists!',
                        desc: 'Customer group id <b>'+ custId1 + custId2 +'</b> does not exist. Please check the ID and try again',
                        dismissBtnText: 'Ok',
                        enableHtml: true
                    });
        }else{
            gs.popup.init(
                    {
                        title: 'Error!',
                        desc: errorMsg,
                        dismissBtnText: 'Ok',
                        enableHtml: true
                    });
        }
    }

    return{
        init: init
    }
})();