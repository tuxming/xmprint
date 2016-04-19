//扩展date属性方法
Date.prototype.format = function (format) {
    // year
    if (/(y+)/.test(format)) {
        format = format.replace(RegExp.$1, this.getFullYear().toString().substr(4 - RegExp.$1.length));
    }

    // week
    if (/(www)/.test(format)) {
        format = format.replace(RegExp.$1, "星期" + "日一二三四五六".substr(this.getDay(), 1));
    }
    else if (/(ww)/.test(format)) {
        format = format.replace(RegExp.$1, "周" + "日一二三四五六".substr(this.getDay(), 1));
    }

    var o = {
        "M+": this.getMonth() + 1, //month 
        "d+": this.getDate(), //day 
        "h+": this.getHours(), //hour 
        "m+": this.getMinutes(), //minute 
        "s+": this.getSeconds(), //second 
        "q+": Math.floor((this.getMonth() + 3) / 3), //quarter 
        "S": this.getMilliseconds() //millisecond 
    };
    for (var k in o) {
        if (new RegExp("(" + k + ")").test(format)) {
            format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
        }
    }
    return format;
};

/**
 * 局部页面跳转（默认异步）
 * @param url 页面路径url
 * @param target 被填充的dom元素节点
 * @param async
 * @param before 前置方法(页面未载入前操作)
 * @param after 后置方法 (页面载入后可附加操作)
 */
function getContent(url, target, async, before, after) {
    if (url != null && url != "") {
        $.ajax({
            type: "GET",
            url: url + "?r=" + Math.random(),
            dataType: "html",
            async: async == false ? false : true,
            success: function (data) {
                if (before) {
                    data = before(data);
                }

                $(target).html(data);
                history.pushState(url, '');
                if (after) {
                    after(target);
                }
            }
        });
    }
}

// 添加局部页面（默认同步）
function addContent(url, part, async) {
    var content = "";
    if (url != null && url != "") {
        $.ajax({
            type: "GET",
            url: url + "?r=" + Math.random(),
            dataType: "html",
            async: async == true ? true : false,
            success: function (data) {
                if (part != null) content = $(data).filter('[data-name="' + part + '"]').html();
                else content = data;
            }
        });
    }
    return content;
}

// 初始化滚动条
function initScrollbar(target, height, wheelPixel) {
    $(target).mCustomScrollbar({
        setHeight: height == null ? 251 : height,
        autoHideScrollbar: true,
        mouseWheelPixels: nullToString(wheelPixel, 200),
        theme: "minimal"
    });
}

//自动匹配form表单的对象，自动赋值
function jsonToForm(target, data, forceBlank) {
    $(target).find("select").each(function () {
        var v = data[$(this).attr("name")];
        if (v != undefined && (forceBlank || v != '')) $(this).val(v);
    });
    $(target).find("textarea").each(function () {
        var v = data[$(this).attr("name")];
        if (v != undefined && (forceBlank || v != '')) $(this).val(v);
    });
    $(target).find("input").each(function () {
        var type = $(this).attr("type");
        switch (type) {
            case "radio":
                var v = data[$(this).attr("name")];
                if (v != undefined && (forceBlank || v != '')) {
                    var radio = $(target).find("input[name='" + $(this).attr("name") + "'][value='" + v + "']");
                    $(radio).attr("checked", "checked");
                }
                break;
            default:
                var v = data[$(this).attr("name")];
                if (v != undefined && (forceBlank || v != '')) $(this).val(v);
        }
    });

}

//自动封装form表单的所有input，select，textArea对象的value值，key为name，return json
function formToJson(target) {
    var dataMap = {};
    $(target).find("select").each(function () {
        dataMap[$(this).attr("name")] = $(this).val();
    });
    $(target).find("textArea").each(function () {
        dataMap[$(this).attr("name")] = $(this).val();
    });
    $(target).find("input").each(function () {
        var type = $(this).attr("type");
        switch (type) {
            case "radio":
                var val = $(target).find("input[name='" + $(this).attr("name") + "']:checked").val();
                if (val == 'on') val = $(target).find("input[name='" + $(this).attr("name") + "']:checked").attr('value');
                dataMap[$(this).attr("name")] = val;
                break;
            default:
                dataMap[$(this).attr("name")] = $(this).val();
        }
    });
    return dataMap;
}

//自动填充select
function jsonToSelect(url, target, json, valueName, textName, options) {
    callSapiServer(url, function (data) {
        $(target).html("<option value='-1'>请选择</option>");
        for (var i = 0; i < options.length; i++) {
            $(target).append("<option value='" + options[valueName] + "'>" + options[textName] + "</option>");
        }
    }, "POST", json, true);
}

function jsonToSelects() {
    var json = {};
    var selects = "";
    $("select").each(function () {
        var text = $(this).attr("id");
        selects += text;
        selects += ",";
    });
    //orderType,carType,.....moneyType
    selects = selects.substring(0, selects.length - 1);
    $.ajax({
        url: ".......",
        type: "POST",
        data: {selects: selects},
        dataType: 'json',
        success: function (data) {
            //var dataDemo = [{
            //    name: "orderType",
            //    options: [{
            //        key: "a",
            //        value:"b"
            //    }],
            //}];
            for (var i = 0; i < data.length; i++) {
                var name = data[i].name;
                $("#" + name).html("<option value='-1'>请选择</option>");
                var options = data[i].options;
                for (var j = 0; j < options.length; j++) {
                    $("#" + name).append("<option value='" + options[j].key + "'>" + options[j].value + "</option>");
                }
            }
        }
    });
}

//int类型排序，必须调用此方法
function sortNumber(a, b) {
    return a - b
}

/**
 * <pre>
 * 《div id="table">《/div>
 * tab_jsonTable(&quot;body&quot;, [ [ 1, 2, 3, 4, 5, 6 ], [ 1, 2, 3, 4, 5, 6 ] ], [ id,
 *        name, name1, num1, num2, num3 ], function(td, row, column, content) {
 *			//td 当前这个table的td
 *			//row  数据的第n行
 *			//column  当前数据行的第 n 列
 *			//content 列内容
 *
 *		switch(column){
 *			case 0: return null;
 *			case 1: return content.toDate();
 *			case 2: return parseInt(content);
 *			default:
 *				return content;
 *		}
 * 	}, function(tb) {
 * 		tb.find(&quot;td&quot;).css(&quot;padding&quot;, &quot;5px&quot;);
 * 		tb.css(&quot;width&quot;, &quot;100%&quot;);
 * 	});
 * </pre>
 * @param target 填充 目标
 * @param data 数据 [ [ 1, 2, 3, 4, 5, 6 ], [ 1, 2, 3, 4, 5, 6 ] ]
 * @param head 表头 ["序号","标题1","标题2"...]
 * @param onCellCreate  过滤数据方法
 * @param onComplete  table处理方法
 */
function tab_jsonTable(target, data, head, onCellCreate, onComplete, isShowHead, caption) {
    var t = $("<table></table>");
    var thead = $("<thead></thead>").appendTo(t);
    var trh = $("<tr></tr>").appendTo(thead);
    var tb = $("<tbody></tbody>").appendTo(t);

    if (caption) {
        t.append('<caption><label>' + caption + '</label></caption>');
    }

    if ((undefined == isShowHead ? true : isShowHead))
        if (head) {
            for (var i = 0; i < head.length; i++) {
                if (head[i] != null)
                    $("<th></th>").appendTo(trh).append(head[i]);
            }
        }

    if (!data || data.length == 0) {
        var td = $("<td></td>").appendTo($("<tr></tr>").appendTo(tb)).append(
            "暂无内容");
        if (head)
            td.attr("colspan", head.length);
    } else {
        for (var j = 0; j < data.length; j++) {
            var trc = $("<tr></tr>").appendTo(tb);
            for (var k = 0; k < head.length; k++) {
                var td = $("<td></td>").appendTo(trc);
                var hi = data[j];
                if (onCellCreate) {
                    var rs = onCellCreate(td, j, k, hi);
                    if (typeof (rs) == "undefined") {
                    } else if (null == rs) {
                        td.remove();
                        continue;
                    } else {
                        hi = rs;
                    }
                }
                td.append(hi);
            }
        }
    }
    if (target) $(target).html(t);

    if (onComplete) onComplete(t);

}

/**
 * <pre>
 * 《div id="table">《/div>
 * @param target 填充 目标
 * @param data 数据 [{},{},{}]
 * @param head 表头 [{id:"id":label:"标题"},{},{}...]
 * @param onComplete  table处理方法
 * @param options 表格全局配置，如：{haveSerialNum:true}，该配置，配置了是否增加 序列 列
 */

function tab_reportTable(target, data, head, onComplete, options) {
    var t = $("<table></table>");
    var thead = $("<thead></thead>").appendTo(t);
    var trh = $("<tr></tr>").appendTo(thead);
    var tb = $("<tbody></tbody>").appendTo(t);
    var defaultOptions = {
        haveSerialNum: false
    };
    if (options == null) {
        options = defaultOptions;
    }
    var haveSerialNum = options["haveSerialNum"] == null ? false : options["haveSerialNum"];
    if (head) {
        if (haveSerialNum) {
            $("<th id='rowId'></th>").appendTo(trh).append("序号");
        }
        for (var i = 0; i < head.length; i++) {
            if (head[i] != null)
                $("<th id='" + head[i]["id"] + "'></th>").appendTo(trh).append(head[i]["label"]);
        }
    }
    if (data.length == 0) {
        var td = $("<td></td>").appendTo($("<tr></tr>").appendTo(tb)).append(
            "暂无内容");
        if (head)
            haveSerialNum ? td.attr("colspan", head.length + 1) : td.attr("colspan", head.length);
    } else {
        for (var i = 0; i < data.length; i++) {
            var tr = $("<tr></tr>");
            if (haveSerialNum) {
                $("<td>" + (i + 1) + "</td>").appendTo(tr);
            }
            var obj = data[i];
            for (var j = 0; j < head.length; j++) {
                var key = head[j]["id"];
                $("<td>" + obj[key] + "</td>").appendTo(tr);
            }
            $(tb).append(tr);
        }
    }
    if (target) $(target).html(t);

    if (onComplete) onComplete(t);
}

function nullToString(text, format) {
    if (typeof (format) == 'undefined' || format == null) {
        format == "--";
    }
    if (typeof (text) == 'undefined' || text == null || text == "") {
        return format;
    } else {
        return text;
    }
}


/**
 * version 2.0
 *
 *<pre>
 *     var mappings = {
 *               "序号" :function(td, row, column, content){
 *                   return row + 1;
 *               },
 *               "合同编号":function(td, row, column, content){
 *                   return "<a href='#'>"+content.id+"</a>";
 *               },
 *               "合同单位":function(td, row, column, content){
 *                   return content.name;
 *               },
 *               "生产量":function(td, row, column, content){
 *                   return content.age;
 *               }
 *      };
 *
 *      var data = [{"id":1,"name":"张三","age":15},{"id":2,"name":"李四","age":18}];
 *
 *      tab_jsonDivTable($("#table"),data,mappings,function(tab){})
 *</pre>
 * @param target
 * @param data
 * @param head
 * @param onCellCreate
 * @param onComplete
 */
function tab_jsonDivTable(target, data, mapping, onComplete, onFilling, onNothing, caption) {
    var t = $("<table></table>");
    var thead = $("<thead></thead>").appendTo(t);
    var trh = $("<tr></tr>").appendTo(thead);
    var tb = $("<tbody></tbody>").appendTo(t);

    if (caption) {
        t.append('<caption><label>' + caption + '</label></caption>');
    }

    var head = [];
    if (mapping)
        for (var key in mapping)
            head.push(key);

    if (head) {
        for (var i = 0; i < head.length; i++) {
            if (head[i] != null)
                $("<th></th>").appendTo(trh).append(head[i]);
        }
    }
    if (!data || data.length == 0) {
        var td = $("<td></td>").appendTo($("<tr></tr>").appendTo(tb));

        if (onNothing)
            onNothing(td);
        else
            $(td).append("暂无内容");

        if (head)
            td.attr("colspan", head.length);
    } else {
        for (var j = 0; j < data.length; j++) {
            var trc = $("<tr></tr>").appendTo(tb);
            for (var k = 0; k < head.length; k++) {
                var td = $("<td></td>").appendTo(trc);
                var hi = data[j];
                if (mapping[head[k]]) {
                    var rs = mapping[head[k]](td, j, k, hi);
                    if (typeof (rs) == "undefined") {
                    } else if (null == rs) {
                        td.remove();
                        continue;
                    } else {
                        hi = rs;
                    }
                }

                td.append(hi);
            }
        }
    }

    if (target)
        if (onFilling)
            onFilling(target, t);
        else
            $(target).html(t);

    if (onComplete) onComplete(t);

}

function com_getQueryValueInURL(location, lowcaseName) {
    var query;
    if (location != null && typeof(location) == "object") {
        query = location.search;
    }
    else {
        var a = location.indexOf('?');
        if (a > 0) {
            query = location.substring(a);
        } else {
            query = "";
        }
    }

    var params = query.substring(1).split("&", 10);
    for (var i = params.length; --i >= 0;) {
        var ia = params[i].indexOf("=", 1);
        if (ia < 0) continue;
        if (params[i].substring(0, ia).toLocaleLowerCase() == lowcaseName) {
            return params[i].substring(ia + 1);
        }
    }
    return null;
}


/***
 * 设置报表打印按钮
 * @param target 打印按钮,目前指定为必须为超链接
 * @param page 打印的页面
 * @param year
 * @param month
 * @param day
 * @param reportName
 */
function reportPrint(target, page, year, month, day, reportName) {
    var mapping = {"y": year, "m": month, "d": day, "p": page, rname: reportName};

    target.click(function () {
        var href = "/views/print/print.html?1=1";
        for (var key in mapping) {
            var val = ((typeof mapping[key]) == "function" ? mapping[key]() : mapping[key]);
            if (val) {
                href += "&" + key + "=" + val;
            }
        }

        $(this).attr("href", href);
    });
}

String.prototype.endsWith = function (str) {
    return new RegExp(str + "$").test(this);
};

String.prototype.startWith = function (str) {
    if (str == null || str == "" || this.length == 0 || str.length > this.length)
        return false;
    if (this.substr(0, str.length) == str)
        return true;
    else
        return false;
    return true;
};

/***
 * 校验时间先后
 * @param beginObj
 * @param endObj
 */
function common_setStartAndEndEvent(beginIpt, endIpt, endDate, beginEndDate) {
    if (beginEndDate) {
        $(beginIpt).datepicker("setEndDate", beginEndDate);
    }
    $(beginIpt).change(function () {
        var beginDateValue = $(this).val();
        var endDateValue = $(endIpt).val();
        var sourceDate = $(this).data("source");
        if (!moment($(this).val()).isValid()) {
            alert("日期不合法!");
            if (sourceDate) {
                if (new Date(sourceDate).getTime() > new Date(endDateValue).getTime()) {
                    $(this).val("");
                } else {
                    $(this).val(sourceDate);
                }
            } else {
                $(this).val("");
            }
            return false;
        }

        if (beginDateValue && endDateValue) {
            var begin = new Date(beginDateValue);
            var end = new Date(endDateValue);

            if (begin.getTime() > end.getTime()) {
                alert($(this).siblings("label:first").text() + "不能晚于" + endIpt.siblings("label:first").text() + "!");
                if (sourceDate) {
                    if (new Date(sourceDate).getTime() > end.getTime()) {
                        $(this).val("");
                    } else {
                        $(this).val(sourceDate);
                    }
                } else {
                    $(this).val("");
                }
                return false;
            }
        }
        $(this).data("source", beginDateValue);


        $(endIpt).datepicker("setStartDate", $(this).val());
        if (endDate) {
            $(endIpt).datepicker("setEndDate", endDate);
        }
    });

    $(endIpt).change(function () {
        var endDateValue = $(this).val();
        var beginDateValue = $(beginIpt).val();
        var sourceDate = $(this).data("source");

        if (!moment($(this).val()).isValid()) {
            alert("日期不合法!");
            if (sourceDate) {
                if (new Date(sourceDate).getTime() < new Date(beginDateValue).getTime()) {
                    $(this).val("");
                } else {
                    $(this).val(sourceDate);
                }
            } else {
                $(this).val("");
            }
            return false;
        }

        if (beginDateValue && endDateValue) {
            var begin = new Date(beginDateValue);
            var end = new Date(endDateValue);

            if (end.getTime() < begin.getTime()) {
                alert($(this).siblings("label:first").text() + "不能早于" + $(beginIpt).siblings("label:first").text() + "!");
                if (sourceDate) {
                    if (new Date(sourceDate).getTime() < begin.getTime()) {
                        $(this).val("");
                    } else {
                        $(this).val(sourceDate);
                    }
                } else {
                    $(this).val("");
                }
                return false;
            }
        }

        $(this).data("source", endDateValue);

        $(beginIpt).datepicker("setEndDate", $(this).val());
    });

    if($(beginIpt).val()){
        $(beginIpt).change();
    }
}