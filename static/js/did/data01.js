var project_name = '';
var project_id = '';
var location_name = '';
var location_id = '';
var station_id = '';
var station_name = '';
var edit_data = '';
var dataselect = [];
var projecttype = '';

var year = ""; // 년도
var month = "";  // 월
var date = ""; //날짜

var termstart = "";
var termend = "";
var datasave = "";
var datasave_excel = "";
var ratedate = "";

var find_station_edit_data = [];
let tooltip_data_list = [];
let tooltip_data_excel_list = [];
var data_status;
var data_status_user;
var not_data_list ="";

let excel_id = "";
let exceltime;
let exceldata;

//0 요청 가능 1 실행중
let excelstatus = 0;



$(function(){

	check_data_null_user("first");
	setInterval(function() {
		check_data_null_user();
	 }, 30000);

     $(window).bind("orientationchange", function(){
        var orientation = window.orientation;
        var new_orientation = (orientation) ? 0 : 90 + orientation;
                $('body').css({
                "-webkit-transform": "rotate(" + new_orientation + "deg)"     
            });
        });
 
    $('#DOWNLOAD').attr('disabled', true)
    document.getElementById('DOWNLOAD').style.backgroundColor='#CCCCCC';
    


    //********************* ztree **********
    // ztree 
	$.ajax({
        type: "POST",
        url: "/station/search",
        async : false,
        success : function(json) {
            edit_data = json.data;
			find_station_edit_data = edit_data
          
			$('#project_name').text(edit_data[0].project_name)
           
			datasave = 'p'+edit_data[0].project_id
       
			datasave_excel = 'p'+edit_data[0].project_id
			
			$("#project_nav").text(' > '+edit_data[0].project_name)
            $("#location_nav").text('')
            $("#station_nav").text('')

        },
        error: function(json){
            console.log("ztree data loading error")
        }
    });

	var zNodes =[];

	var project = [];
	for(var i = 0; i < edit_data.length ; i++){
		
		if (project.indexOf(edit_data[i].project_name) == "-1"){
			project.push(edit_data[i].project_name)
            zNodes.push({ id: "p"+edit_data[i].project_id, pId:0, name: edit_data[i].project_name });
            // if(project.length == 1){
            //     zNodes.push({ id: "p"+edit_data[i].project_id, pId:0, name: edit_data[i].project_name, open:true });
            // }else{
            //     zNodes.push({ id: "p"+edit_data[i].project_id, pId:0, name: edit_data[i].project_name });
            // }
		}
	}

	var location = [];
	for(var i = 0; i < edit_data.length ; i++){
		
		if (location.indexOf(edit_data[i].location_name) == "-1"){
			location.push(edit_data[i].location_name)
            zNodes.push({ id:"l"+edit_data[i].location_id, pId:"p"+edit_data[i].project_id, name:edit_data[i].location_name});
            // if(location.length == 1){
            //     zNodes.push({ id:"l"+edit_data[i].location_id, pId:"p"+edit_data[i].project_id, name:edit_data[i].location_name, open:true});
            // }else{
            //     zNodes.push({ id:"l"+edit_data[i].location_id, pId:"p"+edit_data[i].project_id, name:edit_data[i].location_name});
            // }
			
		}
	}
    

	var station = [];
	for(var i = 0; i < edit_data.length ; i++){
		
		if (station.indexOf(edit_data[i].station_id) == "-1"){
			station.push(edit_data[i].station_name)
			zNodes.push({ id: "s"+edit_data[i].station_seq, pId: "l"+edit_data[i].location_id, name: edit_data[i].station_name})
		}
	}
	
    var setting = {
		data: {
			simpleData: {
				enable: true
			}
		},
        callback : {
            beforeClick: getnodeid,
            onExpand : OnExpand,
		
        },
        view: {
            addDiyDom: addDiyDom,
			addHoverDom: addHoverDom,
			removeHoverDom: removeHoverDom,
        }
	};
	
	let a = $(document).ready(function(){
		$.fn.zTree.init($("#treeDemo"), setting, zNodes);
        
        mapping_data_img();
      
        var treeObj = $.fn.zTree.getZTreeObj("treeDemo");
        var node = treeObj.getNodeByTId("treeDemo_1");
        console.log("CHECK",node);
        treeObj.selectNode(node);

         // MOUSE EVENT
         $("#tooltip—01").removeClass('showtooltip');
         $("#tooltip—01").addClass('hidetooltip');

	});
    
	tooltip_data_excel()

	function addHoverDom(treeId, treeNode) {
        // console.log("IN HOVER");
		// console.log(treeNode.id)
		datasave = treeNode.id
        //********************* TOOLTIP  **********
        if(treeNode.level == 2 && treeNode.id.indexOf("s")>-1){
            var tooltip = '[class^="tooltip"]'; 
  
            $(tooltip).click(function(e){ 
                return false; 
            }); 
            
			tooltip_data()
        
                
            console.log("HELLO")
            var data_length = tooltip_data_list.length
            console.log("LENGTH", tooltip_data_list.length)
            $('#tooltip_table').empty()
            if(tooltip_data_list.length > 0 && tooltip_data_list.length < 11 ){
                for(var i = 0 ; i < tooltip_data_list.length; i++){
                        $('#tooltip_table').append("<tr><td>"+ tooltip_data_list[i].monitoring_date+"</td></td>")
                }
            }else if(tooltip_data_list.length > 10 && tooltip_data_list.length < 21 ){
                for(var i = 0 ; i < tooltip_data_list.length; i++){
                    if(i < 10 && i+10 < tooltip_data_list.length){
                        $('#tooltip_table').append("<tr><td>"+ tooltip_data_list[i].monitoring_date+"</td><td>"+tooltip_data_list[i+10].monitoring_date+"</td></tr>")
                    }else if(i < 10 && i+10 >= tooltip_data_list.length){
                        $('#tooltip_table').append("<tr><td>"+ tooltip_data_list[i].monitoring_date+"</td><tr>")
                    }
                    
                }
            }else if(tooltip_data_list.length > 20 && tooltip_data_list.length < 31 ){
                for(var i = 0 ; i < tooltip_data_list.length; i++){
                    if(i < 10 && i+20 < tooltip_data_list.length){
                        $('#tooltip_table').append("<tr><td>"+ tooltip_data_list[i].monitoring_date+"</td><td>"+tooltip_data_list[i+10].monitoring_date+"</td><td>"+tooltip_data_list[i+20].monitoring_date+"</td></tr>")
                    }else if(i < 10 && i+20 >= tooltip_data_list.length){
                        $('#tooltip_table').append("<tr><td>"+ tooltip_data_list[i].monitoring_date+"</td><td>"+tooltip_data_list[i+10].monitoring_date+"</td><tr>")
                    }
                    
                }
            }
  

            // TOOLTIP 위치 셋팅
            var $this = $('[class="tree_wrap"]'), 
            $href = "#tooltip—01",
            $top = 370,
            $left = 240 ; 
            
            var config = { 
                tooltipstyle : { 
                    position : 'absolute', 
                    top : $top, 
                    left : $left, 
                    zIndex: 9999 
                }
            }; 
            $($href).css(config.tooltipstyle); 
            // tooltip_data(treeNode.id, "ztree");
           // MOUSE EVENT
           $($href).removeClass('hidetooltip');
           $($href).addClass('showtooltip');
        } else {
            return;
        }
	}

	function removeHoverDom(treeId, treeNode) {
        console.log("OUT HOVER");

        // TOOLTIP 위치 셋팅
        $href = "#tooltip—01",
        
        
        // MOUSE EVENT
        $($href).removeClass('showtooltip');
        $($href).addClass('hidetooltip');
    };


	function addDiyDom(treeId, treeNode){

        if(treeNode.level == 2 && treeNode.id.indexOf("s")>-1){
            console.log("INININ");
            var aObj = $("#" + treeNode.tId + "_ico");       
            var editStr = "";

            var editStr = "<img id='diyBtn_" +treeNode.id+ "' class='ztreeimg' src=''></img>";
            // ul.ztree li li li .button.ico_open { background-image:url("/static/images/tree_2th_on.png"); }
            $("#" + treeNode.tId + "_ico").after(editStr);
        } else {
            return;
        }
        
    }

    function OnExpand(event, treeId, treeNode) {
        console.log("ONEXPAND!!")
        mapping_data_img();        
    };
    

    // $(document).ready(function(){
	// 	$.fn.zTree.init($("#treeDemo01"), setting, zNodes);
	// });

    // 1
    // var node = zTreeObj.getSelectedNodes();
    // console.log(node)
    
    function getnodeid(treeId, treeNode, clickFlag) {
        
        // console.log(treeId);
        // console.log(treeNode);
        // console.log(treeNode.getParentNode()); //부모 노드 찾기
		// console.log(treeNode.id.substr(0,1))
        // console.log(treeNode.children); //선택한 아이디
	
		projecttype = treeNode.id
	

		datasave = treeNode.id
		datasave_excel = treeNode.id
		tooltip_data_excel()
        
        var selecttype = treeNode.id.substr(0,1)
        // console.log(selecttype)
        treenode_id = treeNode.id.substr(1,treeNode.id.length-1) // 앞자리 뻄
        // console.log(treenode_id)
        if (selecttype == 'p'){
            project_id = treenode_id
            $("#project_nav").text(' > '+treeNode.name)
            $("#location_nav").text('')
            $("#station_nav").text('')
            $("#project_name").text(treeNode.name)
			// datasave = 'P'+$('#project_name').text()

			$("#termStart, #termEnd").datepicker().datepicker("setDate", new Date());
            $('#termEnd').datepicker("option", "minDate", new Date())
        }
        else if(selecttype == 'l'){
            $("#project_nav").text(' > '+treeNode.getParentNode().name)
            $("#location_nav").text(' > '+treeNode.name)
			$("#station_nav").text('')
    
            location_id = treenode_id
        
			$("#project_name").text(treeNode.name)

			$("#termStart, #termEnd").datepicker().datepicker("setDate", new Date());
            $('#termEnd').datepicker("option", "minDate", new Date())


        }
        else if(selecttype == 's'){
			$("#project_nav").text(' > '+treeNode.getParentNode().getParentNode().name)
            $("#location_nav").text(' > '+treeNode.getParentNode().name)
            $("#station_nav").text(' > '+treeNode.name)
     
			$("#project_name").text(treeNode.name)
			


			for(let i =0; i < find_station_edit_data.length; i++){
                if(find_station_edit_data[i].station_name == treeNode.name){
                    station_id = find_station_edit_data[i].station_id
                }
             
            }
			
			$("#termStart, #termEnd").datepicker().datepicker("setDate", new Date());
            $('#termEnd').datepicker("option", "minDate", new Date())

        }

    }

	//날짜 선택
	$( "#termStart" ).datepicker({
		dateFormat: 'yy.mm.dd',
		prevText: '이전 달',
		nextText: '다음 달',
		monthNames: ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'],
		monthNamesShort: ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'],
		dayNames: ['일','월','화','수','목','금','토'],
		dayNamesShort: ['일','월','화','수','목','금','토'],
		dayNamesMin: ['일','월','화','수','목','금','토'],
		showMonthAfterYear: true,
		yearSuffix: '년',
        ignoreReadonly: true,

	});

	$( "#termEnd" ).datepicker({
		dateFormat: 'yy.mm.dd',
		prevText: '이전 달',
		nextText: '다음 달',
		monthNames: ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'],
		monthNamesShort: ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'],
		dayNames: ['일','월','화','수','목','금','토'],
		dayNamesShort: ['일','월','화','수','목','금','토'],
		dayNamesMin: ['일','월','화','수','목','금','토'],
		showMonthAfterYear: true,
		yearSuffix: '년',
        ignoreReadonly: true,
    
	});

	$( "#termStart, #termEnd" ).attr('readonly',true);

	$( "#termStart" ).change(function(){
		var term = $('#termStart').datepicker("getDate")
		// console.log(term)
		// console.log(term.getMonth()+1)
		// console.log(term.getFullYear())
		$('#termEnd').datepicker("option", "minDate", term)
		
		year = term.getFullYear(); // 년도
        month = ('0'+ (term.getMonth() + 1)).slice(-2);  // 월
        date = ('0' + term.getDate()).slice(-2); 
        $('#current_date').text(year+'-'+month+'-'+date)
        termstart = year+'-'+month+'-'+date
	})
    $("#termStart, #termEnd").datepicker().datepicker("setDate", new Date());
    $('#termEnd').datepicker("option", "minDate", new Date())

	var dataselect = ['DDC01','DDC02','DDC03'];
    $('#dataselect').on('change', 'input[type="checkbox"]', function(){
        dataselect = []
        var findcheck = $('input[type="checkbox"]:checked').closest('span').find('label').text()
        for(var i = 0; i < findcheck.length/5; i++){
            dataselect.push(findcheck.substr(i*5, 5))
        } 
	    
    })

	$( "#termEnd" ).change(function(){
		var term = $('#termEnd').datepicker("getDate")
		year = term.getFullYear(); // 년도
        month = ('0'+ (term.getMonth() + 1)).slice(-2);  // 월
        date = ('0' + term.getDate()).slice(-2); 
        $('#current_date').text(year+'-'+month+'-'+date)
        termend = year+'-'+month+'-'+date
	})

	// 처음화면 오늘 데이터
    $("#termStart, #termEnd").datepicker().datepicker("setDate", new Date());
    $('#termEnd').datepicker("option", "minDate", new Date())
	var today = new Date();   
  
   
    year = today.getFullYear(); // 년도
    month = ('0'+ (today.getMonth() + 1)).slice(-2);  // 월
    date = ('0' + today.getDate()).slice(-2);  // 날짜 (“0” + this.getDate()).slice(-2);
    termend = year+'-'+month+'-'+date
	termstart = year+'-'+month+'-'+date

	$('#updaterate').on('change', function(){
		sele = $('#updaterate option:selected').text()
	
	})
	
	
    //excel
	$("#btnExportPopup").click(function(e) {
       

        if(excelstatus == 0){
            $('#DOWNLOAD').attr('disabled', true)
            document.getElementById('DOWNLOAD').style.backgroundColor='#CCCCCC';
            excelstatus +=1
            let udp = "";
            for(let i=0; i <dataselect.length; i++){
                udp +=dataselect[i]
                // if(udp.length == 0){
                // 	udp += "'" + dataselect[i]+"'"
                // }else{
                // 	udp += ", '" + dataselect[i]+"'"
                // }
            }
            if(termstart == ""){
                alert("시작 날짜를 입력해주세요.");
                return;
            }else if(termend == ""){
                alert("마지막 날짜를 입력해주세요.");
                return;
            }else if(udp.length == 0){
                alert("Data select 선택 해주세요.");
                return;
            }

            ratedate = $('#updaterate option:selected').text()
            // selectdata(projecttype)
            console.log("ENTER!!!! DOWNLOAD!!!");
            url = "/data/download?startdate="+termstart+"&enddate="+termend+"&datasave="+datasave_excel+"&ratedate="+ratedate+"&udp="+udp;
            e.preventDefault();  //stop the browser from following

            $.ajax({
                type: "GET",
                url: url,
                async : false,
                success : function(json) {
                    // console.log(json)
                    excel_id = json.data[0].excel_id

                    // console.log(json.url);
                    // $("#spinner_wrap").hide();
                    // window.location.href = json.url; 
                    excelload()

                      
                    alert("엑셀 파일 요청이 전송되었습니다. DOWNLOAD 버튼이 활성화 되면 클릭해주세요. 완료되기 전까지 화면 이동을 삼가해주세요.")
                },
                error: function(json){
                    console.log("data load error")
                }
            });
        }else{
            alert("요청중인 엑셀파일이 존재합니다.")
        }

            
       
		
    });

    function excelload(){
        console.log(excel_id)
        exceltime = setInterval(() => {
            $.ajax({
                type: "post",
                url: '/data/download?excel_id='+excel_id,
                async : false,
                success : function(json) {
                    console.log(JSON.parse(json.data))
                    // console.log(json.url);
                    // $("#spinner_wrap").hide();
                    exceldata = JSON.parse(json.data)
                    if(exceldata.excel_url){
                        clearInterval(exceltime)
                        excelstatus = 0
                        
                        $('#DOWNLOAD').attr('disabled', false)
                        document.getElementById('DOWNLOAD').style.backgroundColor='#FFF';
                        // window.location.href = json.data[0].excel_url;  
                    }
                    // window.location.href = json.url;        
                },
                error: function(json){
                    console.log("데이터 전송 오류")
                }
            });    
        }, 10000);     
        
    }

    $('#DOWNLOAD').click(function(){
        window.location.href = exceldata.excel_url;  
    })

	//********************* TOOLTIP  **********
	var tooltip = '[class^="tooltip"]'; 
	
	$(tooltip).click(function(e){ 
		return false; 
	}); 
	
	//mouseover
	$('.input_data').on('mouseenter mouseleave', function(e) { 
		
		var data_length = edit_data.length
		$('#tooltip_table').empty()
		console.log("hello", tooltip_data_excel_list.length)
        if(tooltip_data_excel_list.length > 0 && tooltip_data_excel_list.length < 11 ){
            
            for(var i = 0 ; i < tooltip_data_excel_list.length; i++){
                $('#tooltip_table').append("<tr><td>"+ tooltip_data_excel_list[i].monitoring_date+"</td></tr>")
            }
        }else if(tooltip_data_excel_list.length > 10 && tooltip_data_excel_list.length < 21 ){
            for(var i = 0 ; i < tooltip_data_excel_list.length; i++){
                if(i < 10 && i+10 < tooltip_data_excel_list.length){
                    $('#tooltip_table').append("<tr><td>"+ tooltip_data_excel_list[i].monitoring_date+"</td><td>"+tooltip_data_excel_list[i+10].monitoring_date+"</td></tr>")
                }else if(i < 10 && i+10 >= tooltip_data_excel_list.length){
                    $('#tooltip_table').append("<tr><td>"+ tooltip_data_excel_list[i].monitoring_date+"</td><tr>")
                }
                
            }
        }else if(tooltip_data_excel_list.length > 20 && tooltip_data_excel_list.length < 31 ){
            for(var i = 0 ; i < tooltip_data_excel_list.length; i++){
                if(i < 10 && i+20 < tooltip_data_excel_list.length){
                    console.log("INInIN")
                    $('#tooltip_table').append("<tr><td>"+ tooltip_data_excel_list[i].monitoring_date+"</td><td>"+tooltip_data_excel_list[i+10].monitoring_date+"</td><td>"+tooltip_data_excel_list[i+20].monitoring_date+"</td></tr>")
                }else if(i < 10 && i+20 >= tooltip_data_excel_list.length){
                    $('#tooltip_table').append("<tr><td>"+ tooltip_data_excel_list[i].monitoring_date+"</td><td>"+tooltip_data_excel_list[i+10].monitoring_date+"</td><tr>")
                }
                
            }
        }

        // TOOLTIP 위치 셋팅
        if (matchMedia("screen and (min-width: 320px) and (max-width:768px) and ( orientation: portrait )").matches) { 
            
            var $this = $(this)
            if($this.attr("id")== "termStart"){
                console.log("LEFT PICKER");
                $('.ui-datepicker ').css({ "margin-left" : "350px", "margin-top": "-35px"});
               
            } else if($this.attr("id")== "termEnd"){   
                console.log("RIGHT PICKER");
                $('.ui-datepicker ').css({ "margin-left" : "503px", "margin-top": "-230px"});
                
            }
        } else { 


            var $this = $(this), 
            $href = "#tooltip—01",
            $top = $this.offset().top, 
            $left = $this.offset().left+ 200; 

         }

		// TOOLTIP 위치 셋팅
		
		
		var config = { 
			tooltipstyle : { 
				position : 'absolute', 
				top : $top, 
				left : $left, 
				zIndex: 9999 
			}
		}; 
		$($href).css(config.tooltipstyle); 
		
		// MOUSE EVENT
        $($href).removeClass('hidetooltip');
        $($href).addClass('showtooltip');
		
		return false; 
	})
	//********************* TOOLTIP  끝 **********

    // 명시적으로 TOOLTIP 없애버리기
    $("body").on("mouseover", function(target){
        var check_class = $(target.target).attr('class');
        var check_parent_class = $(target.target).parent().attr('class');
        if(check_class == 'node_name' && check_parent_class.indexOf("level2") != (-1)){
            console.log("STATION_NODE!!");  
        } else {
            $("#tooltip—01").removeClass('showtooltip');
            $("#tooltip—01").addClass('hidetooltip');
        }
    });



});


//tooltip data error
function tooltip_data(){
    // var datasave = 'S'+station_id

		$.ajax({
			type: "GET",
			url: "/date/tooltip/monitoring?datasave="+datasave,
			// async : false,
			success : function(json) {
				tooltip_data_list = json.data;
				// $('#project_name').text(edit_data[0].project_name)
                console.log("HELLO")
                var data_length = tooltip_data_list.length
                console.log("LENGTH", tooltip_data_list.length)
                $('#tooltip_table').empty()
                if(tooltip_data_list.length > 0 && tooltip_data_list.length < 11 ){
                    for(var i = 0 ; i < tooltip_data_list.length; i++){
                            $('#tooltip_table').append("<tr><td>"+ tooltip_data_list[i].monitoring_date+"</td></td>")
                    }
                }else if(tooltip_data_list.length > 10 && tooltip_data_list.length < 21 ){
                    for(var i = 0 ; i < tooltip_data_list.length; i++){
                        if(i < 10 && i+10 < tooltip_data_list.length){
                            $('#tooltip_table').append("<tr><td>"+ tooltip_data_list[i].monitoring_date+"</td><td>"+tooltip_data_list[i+10].monitoring_date+"</td></tr>")
                        }else if(i < 10 && i+10 >= tooltip_data_list.length){
                            $('#tooltip_table').append("<tr><td>"+ tooltip_data_list[i].monitoring_date+"</td><tr>")
                        }
                        
                    }
                }else if(tooltip_data_list.length > 20 && tooltip_data_list.length < 31 ){
                    for(var i = 0 ; i < tooltip_data_list.length; i++){
                        if(i < 10 && i+20 < tooltip_data_list.length){
                            $('#tooltip_table').append("<tr><td>"+ tooltip_data_list[i].monitoring_date+"</td><td>"+tooltip_data_list[i+10].monitoring_date+"</td><td>"+tooltip_data_list[i+20].monitoring_date+"</td></tr>")
                        }else if(i < 10 && i+20 >= tooltip_data_list.length){
                            $('#tooltip_table').append("<tr><td>"+ tooltip_data_list[i].monitoring_date+"</td><td>"+tooltip_data_list[i+10].monitoring_date+"</td><tr>")
                        }
                        
                    }
                }
		
				
			},
			error: function(json){
				console.log("tooltip data error")
			}
		});
		
}

function tooltip_data_excel(){
	$.ajax({
		type: "GET",
		url: "/date/tooltip/monitoring?datasave="+datasave_excel,
		async : false,
		success : function(json) {
			tooltip_data_excel_list = json.data;
			console.log(tooltip_data_excel_list)
			
		},
		error: function(json){
			console.log("mouseover error")
		}
	});
}





function check_data_null(){
    $.ajax({
        type: "GET",
        url: "/station/datastatus?status=1000",
        async: false,
        success : function(json) {
            data_status = json.data;
          
        },
        error: function(json){
            console.log("긴급에러")
            console.log(json)
        }
    });
}

function mapping_data_img(){
    var zTree = $.fn.zTree.getZTreeObj("treeDemo");
    var nodes = zTree.getNodes();
    function filter(node) {
        return (node.level == 2 && node.id.indexOf("s")>-1);
    }
        
    var st_nodes = zTree.getNodesByFilter(filter); // search the array of the nodes    
    var station_status = [];

    for(j=0; j <data_status_user.length; j++){
        station_status.push(String(data_status_user[j].station_seq));
    }

    for(i=0 ; i < st_nodes.length ; i++){
        
        var regex = /[^0-9]/g;				// 숫자가 아닌 문자열을 선택하는 정규식
        var ztree_station_seq = st_nodes[i].id.replace(regex, "");
        // console.log(st_nodes[i].id);	
        // console.log(ztree_station_seq);	
        // console.log(station_status);	
        if(station_status.indexOf(ztree_station_seq) == (-1)){
            console.log("IN BLUE!!");
            $("#diyBtn_"+st_nodes[i].id).attr('src','/static/images/btn_blue.png')
        } else {
            console.log("IN RED!!");
            $("#diyBtn_"+st_nodes[i].id).attr('src','/static/images/btn_red.png')
        }
    }
    $("#spinner_wrap").hide();
  
}

function check_data_null_user(type){
    var async = true;
    if(type == "first"){
        async = false;
    }
    $.ajax({
        type: "GET",
        url: "/station/datastatus/user?status=1000",
        async: async,
        success : function(json) {
      
            data_status_user = json.data;
            console.log(data_status_user);
			not_data_list = ""
			for(let i=0; i < data_status_user.length; i++){
				not_data_list += " "+ data_status_user[i].station_name
			}
			$('#data_status').text(not_data_list)
			$('#marquee').addClass('marquee')
            if(async){
                mapping_data_img();
            }
            
			
        },
        error: function(json){
            console.log("긴급에러")
            console.log(json)
          
        }
    });

	
}