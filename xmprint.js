/**
 * jquery 选择器
 * 思路：先将html扁平化，如果如果存在指定的class
 * 则做为扁平化子节点，然后再扁平化的html写到一个新窗口
 * 
 * 指定的class说明：
 *  	print-label：需要要遍平化的节点，如果这个节点是孙子节点，则把该节点放到子节点，同时删除子节点
 * 		print-table：用来处理当换页时，表头需要重新出现新一页的页头。
 *		print-tab：	 用来处理tab页面
 * 		print-hr：	 用来添加两个元素之间的间距
 *		print-tab-table：用来处理tab里面有表格，当表格换页时，表头需要重新出现新一页的页头。
 *      print-tab-label：用来处理tab里面的节点
 *		print-tab-hr：用来添加tab里面两个元素之间的间距
 *
 * A) 页面扁平化问题
 * 例1：
 * <div>
 *	<div></div>
 *	<div></div>
 *</div>
 * 转换后也是这个样子。
 * 
 * 例2：
 * <div>
 *  <div class="div1">
 *		<div class="print-label"></div>
 *	<div>
 *	<div class="div2"><div>
 * </div>
 * 扁平化后：
 * <div>
 *	<div class="print-label"></div>
 *	<div class="div2"><div>
 * </div>
 * 这里的div1将会丢失。
 *  
 * 例3：
 * table的约定
 * 如果需要换页的table且在换页后需要重新加上表头的，一定要加print-table, 如：<table class="print-table"></table>
 * table分页需要重新出现表头，只适用于如下结构:(表头要分开来写)
 *	<table>
 *		<thead>
 *			<tr>
 *				<th></th>
 *				<th></th>
 *				   ...
 *			</tr>
 *		</thead>
 *		<tbody>
 *			<tr>
 *				<td></td>
 *				<td></td>
 *				   ....
 *			</tr>
 *		</tbody>
 *	</table>
 * 
 * 例4：
 * 如果出现print-label嵌套，则有如下结果 
 * <div>
 *  <div class="div1 print-label">
 *		<div class="sub-div"></div>
 *		<div class="print-label"></div>
 *	<div>
 *	<div class="div2"><div>
 * </div>
 * 扁平化后：
 * <div>
 *  <div class="div1 print-label">
 *		<div class="sub-div"></div>
 *	<div>
 *	<div class="print-label"></div>
 *	<div class="div2"><div>
 * </div>
 * 
 * 例5：
 * tab的约定：
 * 本例只解析如下tab
 * <div class="print-tab">
 *   <ul>
 *     <li>title1</li>
 *     <li>title2</li>
 *   </ul>
 *	 <div>
 *   	<div>
 *			tab content1
 *			<div>tttt1</div>
 *			<div>bbbbbb</div>
 *		</div>
 *   	<div>
 *			tab content2
 *			<div>ccccc</div>
 *			<div>ddddd</div>
 *		</div>
 *   </div>
 * </div>
 * 扁平化后: 
 *  <ul>
 *		<li>title1></li>
 *	</ul>
 *	tab content1
 *	<div>tttt1</div>
 *	<div>bbbbbb</div>
 *	<ul>
 *		<li>title2></li>
 *	</ul>
 *	tab content2
 *	<div>ccccc</div>
 *	<div>ddddd</div>
 * 
 * 例6：
 * tab的约定2：
 * 本例只解析如下tab
 * <div class="print-tab">
 *   <ul>
 *     <li>title1</li>
 *     <li>title2</li>
 *   </ul>
 *	 <div>
 *   	<div>
 *			<div class="print-tab-label"></div>
 *			<table class="print-tab-table"></table>
 *		</div>
 *   	<div>
 *			<div class="print-tab-label"></div>
 *			<div class="print-tab-label"></div>
 *		</div>
 *   </div>
 * </div>
 * 扁平化后: 
 *  <ul>
 *		<li>title1></li>
 *	</ul>
 *	<div class="print-tab-label"></div>
 *	<table class="print-tab-table"></table>
 *	<ul>
 *		<li>title2></li>
 *	</ul>
 *	<div class="print-tab-label"></div>
 *	<div class="print-tab-label"></div>
 *
 *  修改每一项内容的间的间距问题：print-hr 
 *	<div class="print-hr" style=display:none;width:100%; height:30px;"></div>  
 *
 * B) 关于页边距问题：网页打印默认为：12.7mm(即上，下，左，右)都为12.7mm，在72dpi下面：1mm==2.8px,
 * 也就是页面边距为: (12.7*2.8)px， 如果有改动(就是在浏览器菜单选项里进行了页边距设置)，请手动传入页面距，单位为px
 *
 * C) 关于打印出的高度, 宽度：经测试高度为： 1051px, 高度为： 842px, 如果需要请自己行传入。
 * 
 * D) 关于css引用和js引用问题，把link，script标签的引入到新页面中
 *		(这里有一个路径问题，由于打印的时候打开一个新的空白窗口，在空白窗口下相对路径的link,script引用是无效的， 
 *		所以目前只支持绝对路径)，再将style,script标签下面的文本全部写入
 * 传入参数如下：
 * 
	 options = {
		selector: "print-area", //如果没有则默认去查找id为print-area的区域为打印区域，这里不需要#号
		pageHeight: 842,		//打印页面的每一页面高度
		pageWidth: 1049,		//打印页面的宽度,页面高度为最好为素数：如果高度：1050，与1050最近的素数是：1049，1051，那么取较小的值
		autoPrint: false,		//是不是自动打印，true为自动打印，false为显示预览
		extendHeight:0,  		//如果打印的时候发现内容不全，可通过扩展高度来弥补
		marginTop : parseInt(12.7*2.8),   //页面边距以下参数为可选
		marginBottom: parseInt(12.7*2.8),
		marginLeft : parseInt(12.7*2.8),
		marginRight: parseInt(12.7*2.8)
	 }
 */
function xmprint(settings){
	
	var defaultOptions = {
		selector: "print-area",  
		pageHeight: 1049,
		pageWidth: 680,
		autoPrint: true,
		extendHeight: 0,
		marginTop : parseInt(12.7*2.8),
		marginBottom: parseInt(12.7*2.8),
		marginLeft : parseInt(12.7*2.8),
		marginRight: parseInt(12.7*2.8)
	}
	var options=$.extend({},defaultOptions,settings)
	
	var content = $("#"+options.selector).clone();  //这里调用 clone方法，为下面的节点增删，就不会影响到html页面。
	
	var styles = "";
	var scripts = "";
	
	//得到html里面的样式
	var styleNodes = $("style");
	if(styleNodes && styleNodes.length>0){
		styleNodes.each(function(index, node){
			styles += $(node).html();
		}); 
	}
	content = content.remove("style");
	
	//得到html里面的script
	var scriptNodes = content.find("script");
	if(scriptNodes && scriptNodes.length>0){
		scriptNodes.each(function(index, node){
			scripts += $(node).html();
		});
	}
	content = content.remove("script");
	
	//移除a tag的href,不显然打印的时候会显示为：a标签里面的文本(url)
	content.find("a").removeAttr("href");
	
	//扁平化html节点
	var children = content.children();
	
	var items = [];//[node];
	
	for(var i=0; i<children.length; i++){
		var child = children.eq(i).clone();
		var subChildren = child.find(".print-label, .print-table, .print-tab, .print-hr");
		if(subChildren && subChildren.length>0){
			//process
			for(var j=0; j<subChildren.length; j++){
				var subChild = subChildren.eq(j).clone();
				subChild.find(".print-label, .print-table, .print-tab, .print-hr").remove();
				items.push(subChild);
			}
		}else{
			items.push(child);
		}
	}
		
	//得到css引用, 得到js引用 
	var printLinks = [];
	$("script").each(function(index, ele){
		var elem = $(ele);
		if(elem.attr("src"))
			printLinks.push(elem.prop("outerHTML"))
	});
	$("link").each(function(index, ele){
		var elem = $(ele);
		if(elem.attr("href"))
			printLinks.push(elem.prop("outerHTML"));
	});
	
	//加入节点，并计算高度，考虑是不是另起一页 frameborder="no" border="0" marginwidth="0" marginheight="0"
	var iframeId = "iframe_"+generatorId();
	var iframe = $("<iframe></iframe>")
		.attr("frameborder", "no").attr("border", "0").attr("marginwidth", "0").attr("width","100%")
		.attr("marginheight", "0").attr("scrolling","no")
		.attr("id", iframeId)
		.css({"background":"#ffffff", "position":"absolute", "z-index":"100","top":"0px", "left":"0px"});
	$(document.body).append(iframe);
	
	var headerHtml = "";
	for(var i=0; i<printLinks.length; i++){
		headerHtml += printLinks[i];
	}
	headerHtml = headerHtml + "<script>"+scripts+"</script><style>"+styles+"</style>";
	
	//<iframe id="preview" height="340" width="100%" frameborder="0"></iframe>  
	//var doc = document.getElementById("preview").contentDocument || document.frames["preview"].document;  
	
	//var printDoc = w.document; 
	//var printDoc = iframe.get(0).contentDocument || iframe.get(0).document;
	var myFrame = document.getElementById(iframeId);
		
	var printDoc = myFrame.contentDocument || myFrame.document || myFrame.contentWindow.document;
	
	printDoc.open();
	
	//onclick='javascript:this.style.display=\"none\";  
	//var frame = $(window.parent.document).find(\"#"+iframeId+"\"); 
	//frame.remove(); 
	//$(window.parent.document.body).children().show(); window.print();
	printDoc.write("<html><body><script type='text/javascript'>function clickPrintBtn(element){ /*点击打印按钮，开始打印*/ element.style.display='none'; window.print();$(window.parent.document.body).children().show(); var frame = $(window.parent.document).find('#"+iframeId+"');frame.remove(); }</script></body></html>");
	printDoc.close();
	
	printDoc.head.innerHTML = headerHtml;
	
	var containerClass=content.attr("class");
	var containerStyle=content.attr("style");
	if(!containerStyle){
		containerStyle = "";
	}
	containerStyle += ";width:"+options.pageWidth+"px; "
	
	var containerId="printer-container"
	
	printBtn = "";  
	if(!options.autoPrint){
		printBtn = "<button id='print-now-btn' style='display:block;' onclick='clickPrintBtn(this);'>打印</button>";
	}
	
	var containerHtml = "<div class='"+containerClass+"' id='"+containerId+"' style='"+containerStyle+"'>"+printBtn+"</div>";
	printDoc.body.innerHTML += containerHtml;
	
	var container = printDoc.getElementById(containerId);
	
	var actHeight = (options.pageHeight - (options.marginTop+options.marginBottom));
	
	for(var i=0; i<items.length; i++){
		var item =  items[i];
		//.print-label, .print-table, .print-tab
		if(item.hasClass("print-label")){
			container.appendChild(item.get(0));
		}else if(item.hasClass("print-table")){
			processTable(container, item);
		}else if(item.hasClass("print-tab")){
			
			//得到tab结构，
			//把组装成pane样子
			var tabTitleUL = item.children("ul");
			var tabTitles = tabTitleUL.children();  //li
			var tabContentBox = item.children("div");
			var tabContents = tabContentBox.children();  //div
			
			//var styles = {"opacity": 1, "display": "block"}; //用来将隐藏的tab给显示 
			
			for(var j=0; j<tabTitles.length; j++){
				
				var title = tabTitles.eq(j);
				
				var titlePanel = "<ul class='"+tabTitleUL.attr("class")+"'>"+title.html()+"</ul>"
				container.appendChild($(titlePanel).get(0));
				
				var tabContent = tabContents.eq(j);
				var tabContentItems = tabContent.find(".print-tab-table, .print-tab-label, .print-tab-hr");
				for(var k=0; k<tabContentItems.length;k++){
					var tabItem = tabContentItems.eq(k);
					if(tabItem.hasClass("print-tab-table")){
						processTable(container, tabItem);
					}else{
						container.appendChild(tabItem.get(0));	
					}
				}
			}
					
		}else if(item.hasClass("print-hr")){
			container.appendChild(item.css("display",  "block").get(0));
		}else {
			container.appendChild(item.get(0));
		}
		
	}
	
	function generatorId(){
		return new Date().getTime()+""+parseInt(Math.random()*100);
	}
	
	function processTable(container, table){
		
		var thead =  table.children("thead");
		var rows = table.children("tbody").children("tr");
		
		var totalHeight = printDoc.getElementById(containerId).offsetHeight;
		
		var classes =  table.attr('class');
		var tbodyId = "tbody_"+generatorId();
		var tbaleId = "table_"+generatorId();
		var tableModule = '<table id="'+tbaleId+'" class="'+classes+'">'+thead.prop('outerHTML')+'<tbody id="'+tbodyId+'"></tbody></table>';
		
		container.appendChild($(tableModule).get(0));
		printDoc.getElementById(tbodyId).appendChild(rows.eq(0).get(0));
		
		var theadHeight = printDoc.getElementById(tbaleId).children[0].children[0].offsetHeight;  //div > table > thead > tr
		var rowHeight =  printDoc.getElementById(tbaleId).children[1].children[0].offsetHeight; //div > table > tbody > tr
		
		var newPageLine =  $("<div style='page-break-before:always;height:1px;'>&nbsp;</div>"); //<div style='page-break-before:always;'><br /></div>
		
		var aa = (totalHeight%actHeight+rowHeight+theadHeight);
		console.log("rowHeight:"+rowHeight+", theadHeight:"+theadHeight+", totalHeight:"+totalHeight+", 当前页面高度："+aa);
		
		//如果加了表头，再加了一行就会换一页的话，则先起一页再加表头
		var j=1;
		if((totalHeight%actHeight+rowHeight+theadHeight)>actHeight){
			printDoc.getElementById(tbaleId).outerHTML = "";
			var j = 0;
			container.appendChild(newPageLine.clone().get(0));
		}
		
		for(; j<rows.length; j++){
			var $row = rows.eq(j);
			
			totalHeight = printDoc.getElementById(containerId).offsetHeight;
			
			var cc = (totalHeight%actHeight+rowHeight);
			
			//这里的1，换行符的高度
			if((totalHeight%actHeight+rowHeight+1)>actHeight){
				console.log("当前页面高度："+cc+", actHeight:"+actHeight);
				//new page
				//container.appendChild(newPageLine.get(0));
				
				tbodyId = "tbody_"+generatorId();
				tbaleId = "table_"+generatorId();
				
				var tableModule = '<table id="'+tbaleId+'" class="'+classes+'">'+thead.prop('outerHTML')+'<tbody id="'+tbodyId+'"></tbody></table>';
				var tableNode = $(tableModule).get(0);
				container.appendChild(newPageLine.clone().get(0));
				container.appendChild($(tableModule).get(0));
				
			}
			//add row
			printDoc.getElementById(tbodyId).appendChild($row.get(0));
		}
	}
	
	//设置iframe高度，设置成总页面高度：比如总高度为：100px, 一张纸高度：200px, 那么设置高度为：200px
	//这么做防止bootstrap响应式设计在点击打印后，会发生变化
	var fbodyheight = printDoc.body.offsetHeight;
	var fheight = (actHeight-(fbodyheight%actHeight))+fbodyheight+options.extendHeight;
	iframe.attr("height", fheight+"px")
	
	$(document.body).children(":not(script,style)").hide();
	iframe.show();
	
	if(options.autoPrint){
		setTimeout(function(){
			//w.print();
			//w.close();
			//window.print();
			myFrame.contentWindow.print();
			iframe.remove();
			$(document.body).children().show();
		},1500)
	}
	
}