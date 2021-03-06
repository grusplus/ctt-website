let Cloud = {};

Cloud.getApiUrl = () => {
    if(window.location.host.indexOf(".local") > -1) {
        return "http://192.168.50.14:8005/api/"
    }
    return "https://sync.haveagrapefruit.com/api/";
};

Cloud.init = () => {
    let $ = window.jQuery;

    $('#cloud button').prop('disabled', true);

    $('#cloud').on('keyup', 'input', function(event) {
        let keepDisabled = false;
        let $form = $(event.target).closest('form');
        $form.siblings('.error').hide();
        $form.find("input").each(function () {
            if($(this).prop('required') && this.value.length < 2){
                keepDisabled = true;
            }
        });
        if($form.find("input.pw").length > 0 && $form.find("input.pw2").length > 0 && $form.find("input.pw")[0].value != $form.find("input.pw2")[0].value){
            keepDisabled = true;
        }
        if($form.find("input.email").length > 0){
            let emailValue = $form.find("input.email")[0].value;
            if(emailValue.indexOf("@") == -1 || emailValue.indexOf("@")+1 == emailValue.length){
                keepDisabled = true;
            }else if(emailValue.indexOf(".") == -1 || emailValue.indexOf(".")+1 == emailValue.length){
                keepDisabled = true;
            }
        }
        if(!keepDisabled){
            $form.find('button').prop('disabled', false);
        }
    });

    $('#cloud').on('click', 'button', function(event) {
        event.preventDefault();
        let $form = $(event.target).closest('form');
        $form.find('button').prop('disabled', true);
        let endpoint = $form.data("endpoint");
        let url = Cloud.getApiUrl() + endpoint;

        Cloud.fetch(url, "POST", false, $form.serialize(), () => {
            //success
            $form.siblings('.success').show();
            $form.hide();
        }, () => {
            //error
            $form.siblings('.error').show();
        });
    });
};

Cloud.fetch = (url, method, includeToken, bodyObject, successFunction, errorFunction) => {
    let params = {
        method: method,
        headers: Cloud.getHeaders(includeToken),
    };

    if(bodyObject && method != "GET"){
        params['body'] = bodyObject;
    }

    fetch(url, params).then(function(response) {
        if (!response.ok) {
            response.json().then(function(data){
                errorFunction();
            });
        } else {
            response.json().then(function(data){
                successFunction(data);
            });
        }
    }).catch(function(error) {
        errorFunction();
    });
};

Cloud.getHeaders = (includeToken = false, token = "") => {
    let headers = {
        'Content-Type': 'application/x-www-form-urlencoded'
    };

    if(includeToken){
        headers['Authorization'] = 'Bearer ' + token;
    }

    return new Headers(headers);
};

export default Cloud;