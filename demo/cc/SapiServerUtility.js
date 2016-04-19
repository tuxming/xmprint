var staticURL = "http://192.168.1.110:4510";
var SAPIServerURL = "http://192.168.1.110:8885/SAPI/TQ";
function callSapiServer(url, callBackFunc, type, data, async, beforeSend, complete) {
    $.ajax({
        url: SAPIServerURL + url,
        type: type,
        data: (type.toUpperCase() == "POST") && typeof (data) == 'object' ? JSON.stringify(data) : data,
        dataType: 'json',
        async: async ? async : false,
        xhrFields: {
            withCredentials: true
        },
        success: function (data) {
            if (!data.isException) callBackFunc(data);
            else {
                switch (data.errorCode) {
                    case 1: //用户没有登录
                        location.href = "/login.html"; //跳转到登录页面
                        break;
                    case 120: //Session 中缺失客户ID
                        alert(data.errorMessage + "，请重新登录！");
                        location.href = "/login.html"; //跳转到登录页面
                        break;
                    case 121: //未找到客户
                        alert(data.errorMessage + "，请重新登录！");
                        location.href = "/login.html"; //跳转到登录页面
                        break;
                    case 122: //客户环境已停止
                        alert("后台服务已停止，请联系管理员处理。\n" + data.errorMessage);
                        location.href = "/login.html"; //跳转到登录页面
                        break;
                    case 123: //客户环境暂停中
                        alert(data.errorMessage + "，请稍后重试！");
                        break;
                    default:
                        callBackFunc(data);
                }
            }
        },
        beforeSend: beforeSend,
        complete: complete
    });
}

function phoneCallSapiServer(url, callBackFunc, type, data, async, beforeSend, complete) {
    $.ajax({
        url: SAPIServerURL + url,
        type: type,
        data: (type.toUpperCase() == "POST") && typeof (data) == 'object' ? JSON.stringify(data) : data,
        dataType: 'json',
        async: async ? async : false,
        xhrFields: {
            withCredentials: true
        },
        success: function (data) {
            if (!data.isException) callBackFunc(data);
            else {
                switch (data.errorCode) {
                    case 1: //用户没有登录
                        location.href = "/views/phone/login.html"; //跳转到登录页面
                        break;
                    case 120: //Session 中缺失客户ID
                        alert(data.errorMessage + "，请重新登录！");
                        location.href = "/views/phone/login.html"; //跳转到登录页面
                        break;
                    case 121: //未找到客户
                        alert(data.errorMessage + "，请重新登录！");
                        location.href = "/views/phone/login.html"; //跳转到登录页面
                        break;
                    case 122: //客户环境已停止
                        alert("后台服务已停止，请联系管理员处理。\n" + data.errorMessage);
                        location.href = "/views/phone/login.html"; //跳转到登录页面
                        break;
                    case 123: //客户环境暂停中
                        alert(data.errorMessage + "，请稍后重试！");
                        break;
                    default:
                        callBackFunc(data);
                }
            }
        },
        beforeSend: beforeSend,
        complete: complete
    });
}
// USEAGE: callSapiServer("/user/login",show,"POST",null,true); 