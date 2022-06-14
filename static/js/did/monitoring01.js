var google_map ;
var kakao_map ;
var google_markers = [];
var kakao_markers = [];
var treenode_id = "";
var project_id = "";
var location_id = "";
var station_id = "";
var edit_data = [];

var station_udp1 = "";
var station_udp2 = "";
var station_udp3 = "";

var year = ""; // 년도
var month = "";  // 월
var date = ""; //날짜

var selectday = "";
var radiocheck = "";

var selectst = "";
var stationlist = [];
var mapinfodata = [];

var graphlabel = []
var datasets_E = [];
var datasets_N = [];
var datasets_U = [];
var data_E = [];
var data_N = [];
var data_U = [];
var config_E = "";
var config_N = "";
var config_U = "";

var myChart01 = "";
var myChart02 = "";
var myChart03 = "";
var myChart001 = "";
var myChart002 = "";
var myChart003 = "";

var myChart05 = ""
var select_name = "";

var find_station_edit_data = [];
var data_status;  // 10분내로 데이터 들어오고 있는지!
var today;
var progress_info = "" // 프로그래스 무슨 정보인지 ( ztree, marker, date_btn )

var data_status_user;
var not_data_list ="";

let treenode_tid ="";
let tooltip_data_list=[];

let graph_count =0;

$(function(){

    // setInterval(() => {
    //     mapping_data_img();
    // }, 10000);

    $("#btn_search").on('click', function(){
        $("#spinner_wrap").show();

        setTimeout(() => {
            selectgraph();
        }, 500);
    })
  
    
    check_data_null_user("first");
    setInterval(function() {
		check_data_null_user();
	 }, 30000);

    //  setInterval(function() {
	// 	selectgraph();
    //     current_satellite();
	//  }, 10000);



    // 스크롤바 디자인
	if($('.scrollbar-dynamic').length){
		$('.scrollbar-dynamic').scrollbar();
	}
  
     // ztree 
     $.ajax({
        type: "POST",
        url: "/station/search",
        async : false,
        success : function(json) {
            
            edit_data = json.data;
            find_station_edit_data = edit_data
      

            $('#project_name').text(edit_data[0].project_name)
            $('#station_name').text(edit_data[0].station_name)
            $("#project_nav").text(' > '+edit_data[0].project_name + ' > ' +edit_data[0].location_name + ' > '+edit_data[0].station_name)
        
            location_id = edit_data[0].location_id
            station_id = edit_data[0].station_id
            station_udp1 = edit_data[0].station_udp1
            station_udp2 = edit_data[0].station_udp2
            station_udp3 = edit_data[0].station_udp3
            
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
			if(project.length == 1){
                zNodes.push({ id: "p"+edit_data[i].project_id, pId:0, name: edit_data[i].project_name, open:true });
            }else{
                zNodes.push({ id: "p"+edit_data[i].project_id, pId:0, name: edit_data[i].project_name });
            }
		}
	}

	var location = [];
	for(var i = 0; i < edit_data.length ; i++){
		
		if (location.indexOf(edit_data[i].location_name) == "-1"){
			location.push(edit_data[i].location_name)
			if(location.length == 1){
                zNodes.push({ id:"l"+edit_data[i].location_id, pId:"p"+edit_data[i].project_id, name:edit_data[i].location_name, open:true});
            }else{
                zNodes.push({ id:"l"+edit_data[i].location_id, pId:"p"+edit_data[i].project_id, name:edit_data[i].location_name});
            }
		}
	}

	var station = [];
	for(var i = 0; i < edit_data.length ; i++){
		
		if (station.indexOf(edit_data[i].station_id) == "-1"){
			station.push(edit_data[i].station_name)
			zNodes.push({ id: "s"+edit_data[i].station_seq, pId: "l"+edit_data[i].location_id, name:edit_data[i].station_name})
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
            onExpand : OnExpand
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
        var node = treeObj.getNodeByTId("treeDemo_3");
        // console.log("CHECK",node);
        treeObj.selectNode(node);

         // MOUSE EVENT
         $("#tooltip—01").removeClass('showtooltip');
         $("#tooltip—01").addClass('hidetooltip');

	});

    function addHoverDom(treeId, treeNode) {
        // console.log("IN HOVER");
	
		datasave = treeNode.id
        //********************* TOOLTIP  **********
        if(treeNode.level == 2 && treeNode.id.indexOf("s")>-1){
            var tooltip = '[class^="tooltip"]'; 
            console.log("!23")
            $(tooltip).click(function(e){ 
                return false; 
            }); 
            
			tooltip_data()
        
                
            // var data_length = tooltip_data_list.length
            $('#tooltip_table').empty()
			if(tooltip_data_list.length > 0 && tooltip_data_list.length < 11 ){
                for(var i = 0 ; i < tooltip_data_list.length; i++){
                    $('#tooltip_table').append("<tr><td>"+ tooltip_data_list[i].monitoring_date+"</td></tr>")
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
            // if(tooltip_data_list.length < 10){
            //     for(var i = 0 ; i < tooltip_data_list.length; i++){
            //         $('#tooltip_table').append("<tr><td>"+ tooltip_data_list[i].satellite_date+"</td></td>")
            //     }
            // }else{
            //     for(var i = 0 ; i < 10; i++){
            //         $('#tooltip_table').append("<tr><td>"+ tooltip_data_list[data_length-10+i].satellite_date+"</td></td>")
            //     }
            // }

            // TOOLTIP 위치 셋팅
            var $this = $('[class="tree_wrap"]'), 
            $href = "#tooltip—01",
            $top = 320,
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


    
    treenode_tid = "treeDemo_3"
    let treenode_a = "";
    function getnodeid(treeId, treeNode, clickFlag) {

        progress_info = "ztree";
        $("#spinner_wrap").show();
        setTimeout(() => {
 
            // console.log(treeNode.getParentNode()); //부모 노드 찾기
            // console.log(treeNode.children[0].children[0]); //자식의 자식 노드 찾기
            // console.log(treeNode.id); //선택한 아이디

            var selecttype = treeNode.id.substr(0,1)
            
            treenode_id = treeNode.id.substr(1,treeNode.id.length-1) // 앞자리 뻄
            console.log(treenode_id)
        
            if (selecttype == 'p'){
                project_id = treenode_id
                $("#project_nav").text(' > '+treeNode.name)
                $("#location_nav").text(' > '+treeNode.children[0].name)
                $("#station_nav").text(' > '+treeNode.children[0].children[0].name)
                // $("#station_nav").text('')
                $('#project_name').text(treeNode.name)
                $('#station_name').text(treeNode.children[0].children[0].name)

                station_name = treeNode.children[0].children[0].name 

                treenode_tid = treeNode.children[0].children[0].tId 

                var treeObj = $.fn.zTree.getZTreeObj(treeId);
                treeObj.expandNode(treeNode.children[0], true, false, true);

                var treeObj = $.fn.zTree.getZTreeObj("treeDemo");
                node = treeObj.getNodeByTId(treenode_tid);
                treeObj.selectNode(node)

                mapping_data_img();

                for(let i =0; i < find_station_edit_data.length; i++){
                    if(find_station_edit_data[i].station_name == station_name){
                        station_id = find_station_edit_data[i].station_id
                    }
                
                }
                location_id = treeNode.children[0].id.substr(1,treeNode.children[0].id.length)

                var year = today.getFullYear(); // 년도
                var month = ('0'+ (today.getMonth() + 1)).slice(-2);  // 월
                var date = ('0' + today.getDate()).slice(-2);  // 날짜 (“0” + this.getDate()).slice(-2); 

                $('#current_date').text(year+'-'+month+'-'+date)
                selectday = year+'-'+month+'-'+date

                graph_count =0
                current_station_info()
                selectgraph()
                current_satellite()
                GoogleMap()
                KakaoMap();
                // treenode_a = treeNode.children[0].children[0].tId
                // console.log(treeNode);
                // console.log(treeNode.children[0].children[0].tId);
                // $('#'+ treenode_a+"_a").addClass('curSelectedNode')
      
                
                treeNode.children[0]['open'] =true
                
            }
            else if(selecttype == 'l'){
                $("#project_nav").text(' > '+treeNode.getParentNode().name)
                $("#location_nav").text(' > '+treeNode.name)
                $("#station_nav").text(' > '+treeNode.children[0].name)
                $('#station_name').text(treeNode.children[0].name)
                $('#project_name').text(treeNode.getParentNode().name)
                // page_nav = $("#page_nav").text()
                location_id = treenode_id
                station_name = treeNode.children[0].name
                for(let i =0; i < find_station_edit_data.length; i++){
                    if(find_station_edit_data[i].station_name == treeNode.children[0].name){
                        station_id = find_station_edit_data[i].station_id
                    }
                
                }

                $('#current_date').text(year+'-'+month+'-'+date)

                // if(treeNode.children[0].tId != "treeDemo_3"){
                //     $('#treeDemo_3_a').removeClass('curSelectedNode')
                // }
                // treenode_a = treeNode.children[0].tId
                // $('#'+ treenode_a+"_a").addClass('curSelectedNode')
                treenode_tid = treeNode.children[0].tId 
                var treeObj = $.fn.zTree.getZTreeObj(treeId);
                treeObj.expandNode(treeNode, true, false, true);
                
                var treeObj = $.fn.zTree.getZTreeObj("treeDemo");
                node = treeObj.getNodeByTId(treenode_tid);
                treeObj.selectNode(node)

                mapping_data_img();
                

                var year = today.getFullYear(); // 년도
                var month = ('0'+ (today.getMonth() + 1)).slice(-2);  // 월
                var date = ('0' + today.getDate()).slice(-2);  // 날짜 (“0” + this.getDate()).slice(-2);

                $('#current_date').text(year+'-'+month+'-'+date)
                selectday = year+'-'+month+'-'+date

                graph_count =0
                current_station_info()
                selectgraph()
                GoogleMap()
                KakaoMap();
                current_satellite()

            }
            else if(selecttype == 's'){
                // $("#station_nav").text(' > '+treeNode.name)
                station_seq = treenode_id
       
                $('#project_name').text(treeNode.getParentNode().getParentNode().name)
                $('#station_name').text(treeNode.name)

                $("#project_nav").text(' > '+treeNode.getParentNode().getParentNode().name)
                $("#location_nav").text(' > '+treeNode.getParentNode().name)
                $("#station_nav").text(' > '+treeNode.name)
        
                project_id = treeNode.getParentNode().getParentNode().id.substr(1,treeNode.getParentNode().getParentNode().id.length)
                location_id = treeNode.getParentNode().id.substr(1,treeNode.getParentNode().id.length)

                for(let i =0; i < find_station_edit_data.length; i++){
                    if(find_station_edit_data[i].station_name == treeNode.name){
                        station_id = find_station_edit_data[i].station_id
                    }
                
                    
                }
                treenode_tid = treeNode.tId 
             
                today = new Date();   
  
   
                var year = today.getFullYear(); // 년도
                var month = ('0'+ (today.getMonth() + 1)).slice(-2);  // 월
                var date = ('0' + today.getDate()).slice(-2);  // 날짜 (“0” + this.getDate()).slice(-2);
                var day = today.getDay();  

                $('#current_date').text(year+'-'+month+'-'+date)
                selectday = year+'-'+month+'-'+date
           
                graph_count =0
                current_station_info()
                selectgraph()
                current_satellite()
                GoogleMap()
                KakaoMap();

            }}, 500);

            // $('#'+ treeNode.children[0].tId+"_switch").change('click',function(){
            //     console.log("!@3")
            //     $('#'+ treenode_a+"_a").addClass('curSelectedNode')
            // })
            
    }
   
    
        
    // MAP RADO INPUT CHECK
    $('#maptype').on('change', 'input[type="radio"]', function() {
       
        $("#maptype input[type='radio']").each(function() {
            var value = $(this).val();              // value
            var checked = $(this).prop('checked');  // jQuery 1.6 이상 (jQuery 1.6 미만에는 prop()가 없음, checked, selected, disabled는 꼭 prop()를 써야함)
            // var checked = $(this).attr('checked');   // jQuery 1.6 미만 (jQuery 1.6 이상에서는 checked, undefined로 return됨)
            // var checked = $(this).is('checked');
            var $label = $(this).next();
            
            if(checked){
                if($(this).val() == "google"){
                    GoogleMap(mapinfodata);
                    $("#google_map_wrap").show();
                    $("#kakao_map_wrap").hide();
                } else {
                    KakaoMap(mapinfodata);
                    $("#google_map_wrap").hide();
                    $("#kakao_map_wrap").show();

                    // kakao api 이슈 사항. 특정 DIV에 넣을시 제대로 동작 안함. 다시그려주기로 처리 가능.
                    kakao_map.relayout();
                    kakao_map.setCenter(new kakao.maps.LatLng(mapinfodata[0]["lat"],  mapinfodata[0]["lng"]));
                    kakao_map.setLevel(5);
                    kakao_map.relayout();
                    kakao_map.setLevel(6);
                    kakao_map.relayout();
                }
            }
                
        });
    });
    current_satellite()

    // 날짜 이동 버튼
    today = new Date();   
  
   
    var year = today.getFullYear(); // 년도
    var month = ('0'+ (today.getMonth() + 1)).slice(-2);  // 월
    var date = ('0' + today.getDate()).slice(-2);  // 날짜 (“0” + this.getDate()).slice(-2);
    var day = today.getDay();  

    $('#current_date').text(year+'-'+month+'-'+date)
    selectday = year+'-'+month+'-'+date
    selectgraph()
   
    $('#btn_next').click(function(){
        $("#spinner_wrap").show();
        progress_info = "date_btn"
        setTimeout(() => {
            graph_count +=1

            let sellect_current_day = $('#current_date').text()
            console.log("sellect_current_day", sellect_current_day)

            let dayyy = new Date(sellect_current_day.substr(0,4), sellect_current_day.substr(5,2)-1, sellect_current_day.substr(8,2))
            dayyy.setDate(dayyy.getDate() + 1);

            console.log(dayyy)
            year = dayyy.getFullYear(); // 년도
            month = ('0'+ (dayyy.getMonth() + 1)).slice(-2);  // 월
            date = ('0' + dayyy.getDate()).slice(-2); 
            $('#current_date').text(year+'-'+month+'-'+date)
            selectday = year+'-'+month+'-'+date
            console.log(station_id)
            selectgraph()
        }, 500);
    })

    $('#btn_prev').click(function(){
        $("#spinner_wrap").show();
        progress_info = "date_btn"
        setTimeout(() => {
            graph_count +=1
            let sellect_current_day = $('#current_date').text()
            console.log("sellect_current_day", sellect_current_day)
            console.log(sellect_current_day.substr(0,4), sellect_current_day.substr(5,2), sellect_current_day.substr(8,2))

            let dayyy = new Date(sellect_current_day.substr(0,4), sellect_current_day.substr(5,2)-1, sellect_current_day.substr(8,2))
            
            dayyy.setDate(dayyy.getDate() - 1);

            console.log(dayyy)

            year = dayyy.getFullYear(); // 년도
            month = ('0'+ (dayyy.getMonth() + 1)).slice(-2);  // 월
            date = ('0' + dayyy.getDate()).slice(-2); 
            $('#current_date').text(year+'-'+month+'-'+date)
            selectday = year+'-'+month+'-'+date

            console.log(station_id)
            selectgraph()
        }, 500);
    })
    

    // 그래프 클릭시 확대
   
    $('#linechart').click(function(){
        if(myChart001){myChart001.destroy();}
        if(myChart002){myChart002.destroy();}
        if(myChart003){myChart003.destroy();}
      
        $("#linechart_layer").show()

        myChart001 = new Chart(
            document.getElementById('myChart001'),
            config_E
        );
    
        myChart002 = new Chart(
        document.getElementById('myChart002'),
        config_N
        );
    
        myChart003 = new Chart(
        document.getElementById('myChart003'),
        config_U
        );
    })

    var div = document.getElementById('linechart_layer');
    div.addEventListener('mousedown', function(e) {
            var isRightButton;
        e = e || window.event;

        if ("which" in e)  // Gecko (Firefox), WebKit (Safari/Chrome) & Opera
            isRightButton = e.which == 3; 
        else if ("button" in e)  // IE, Opera 
            isRightButton = e.button == 2; 

        if(isRightButton)
            $("#linechart_layer").hide()
    });

    // 모바일 여부
    var isMobile = false;
    
    // PC 환경
    var filter = "win16|win32|win64|mac";
    
    if (navigator.platform) {
        isMobile = filter.indexOf(navigator.platform.toLowerCase()) < 0;
    }

    div.addEventListener('touchend', function(e) {
        if(isMobile)
            $("#linechart_layer").hide()
    });
    // 전체 페이지에서 contextmenu 나타나지 않음.
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
    }, false);
    
    // 체크값에 따라 저장
    radiocheck = "PNG"
    $('#savetype').on('change', 'input[type="radio"]', function(){
        radiocheck = $(this).closest('span').find('label').text()
      
    });

    $('#savebtn').click(function(){
       
        if(radiocheck == 'PNG'){
            downImg()
        }
        else if(radiocheck == 'JPG'){
            downImg_jpg()
        }
        else if(radiocheck == 'PDF'){
           
            pdf_save()
        }
    })

    $("#monitoring_refresh").on('click', function(){
        progress_info = "refresh"
        $("#spinner_wrap").show();

        setTimeout(() => {
            selectgraph();
        }, 500);
    })

    $("#satellite_refresh").on('click', function(){
        progress_info = "refresh"
        $("#spinner_wrap").show();

        setTimeout(() => {
            current_satellite();
        }, 500);
    })

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



function GoogleMap() {
    mapinfodata=[]
    if(mapinfodata.length == 0){
        getmapinfo()
        console.log(mapinfodata)
    }
    if(mapinfodata.length == 0){
        $("#google_map_wrap").html('');
        $("#spinner_wrap").hide();
    }
    console.log(mapinfodata)
    google_map = new google.maps.Map(document.getElementById("google_map_wrap"), {
        zoom: 14,                                                               // 높을수록 확대
        center: { lat: mapinfodata[0]["lat"], lng: mapinfodata[0]["lng"] },
    });
    
    
    var secretMessages = mapinfodata;
    
    
    for (let i = 0; i < secretMessages.length; ++i) {
        google_markers[i] = new google.maps.Marker({
        position: {
        lat: secretMessages[i]["lat"],
        lng: secretMessages[i]["lng"],
        },
        map: google_map,
    });

    google_onclick_marker(google_markers[i], secretMessages[i]["name"], secretMessages[i]["id"]);
    }
    
    google.maps.event.addListenerOnce(google_map, 'tilesloaded', function(){
        // do something only the first time the map is loaded
        console.log("ONLOAD!!")
        $("#spinner_wrap").hide();
        
    });
}

function google_onclick_marker(marker, secretMessage, secretMessage_id) {
    marker.infowindow = new google.maps.InfoWindow({
        content: secretMessage,
    });

    marker.addListener("click", () => {     
        var zTree = $.fn.zTree.getZTreeObj("treeDemo");
        var nodes = zTree.getNodes();

        function filter(node) {
            console.log("CHECK");
            console.log(node);
            return (node.level == 2 && node.id.indexOf("s")>-1 && node.name == secretMessage);
        }
            
        var st_nodes = zTree.getNodesByFilter(filter); // search the array of the nodes  
       

        for(i=0 ; i < st_nodes.length ; i++){
            var regex = /[^0-9]/g;				// 숫자가 아닌 문자열을 선택하는 정규식
            var ztree_station_seq = st_nodes[i].id.replace(regex, "");
            console.log(st_nodes[i].id);
            console.log(st_nodes[i]);
            $("#diyBtn_"+st_nodes[i].id).click();
        }

        // progress_info = "marker";
        // selectst = secretMessage
      
        // for (let i = 0; i < google_markers.length; ++i) {
        //     google_markers[i].infowindow.close();
        // }
        // marker.infowindow.open(marker.get("google_map"), marker);
        // console.log(secretMessage)
        // station_id = secretMessage_id
        // today = new Date();   
  
    
        // var year = today.getFullYear(); // 년도
        // var month = ('0'+ (today.getMonth() + 1)).slice(-2);  // 월
        // var date = ('0' + today.getDate()).slice(-2);  // 날짜 (“0” + this.getDate()).slice(-2);
        // selectday = year+'-'+month+'-'+date
        // $('#current_date').text(year+'-'+month+'-'+date)
        // $("#station_nav").text(secretMessage)
        // $("#station_name").text(secretMessage)
        // selectgraph()
    });

    marker.addListener("mouseover", () => {        

        selectst = secretMessage
      
        for (let i = 0; i < google_markers.length; ++i) {
            google_markers[i].infowindow.close();
        }
        marker.infowindow.open(marker.get("google_map"), marker);
        
    });

    marker.addListener("mouseout", () => {        

        selectst = secretMessage
      
        for (let i = 0; i < google_markers.length; ++i) {
            google_markers[i].infowindow.close();
        }
        marker.infowindow.close(marker.get("google_map"), marker);
        
    });

   
}


function KakaoMap() {
    var container = document.getElementById('kakao_map');                 //지도를 담을 영역의 DOM 레퍼런스

    var options = {                                                 //지도를 생성할 때 필요한 기본 옵션
        center: new kakao.maps.LatLng( mapinfodata[0]["lat"],  mapinfodata[0]["lng"]),       //지도의 중심좌표.
        level: 6                                                    //지도의 레벨(확대, 축소 정도) 낮을수록 확대
    };

    kakao_map = new kakao.maps.Map(container, options);               //지도 생성 및 객체 리턴

    // 마커가 표시될 위치입니다 
    // var markerPosition  = new kakao.maps.LatLng(33.450701, 126.570667); 

    var secretMessages = mapinfodata

    for (let i = 0; i < secretMessages.length; ++i) {

        var markerPosition  = new kakao.maps.LatLng(secretMessages[i]["lat"], secretMessages[i]["lng"]); 

        kakao_markers[i] = new kakao.maps.Marker({
            position: markerPosition
        });

        kakao_markers[i].setMap(kakao_map);
        kakao_onclick_marker(kakao_markers[i], secretMessages[i]["name"], secretMessages[i]["id"]);
    }

    kakao.maps.event.addListener(kakao_map, 'tilesloaded', function(){
        $("#spinner_wrap").hide();
    });
    
    
   
    // 아래 코드는 지도 위의 마커를 제거하는 코드입니다
    // marker.setMap(null);    
}        

function kakao_onclick_marker(marker, secretMessage, secretMessage_id) {
    marker.infowindow = new kakao.maps.InfoWindow({
        content: secretMessage,
        removable : true
    });
    
    marker.addListener("click", () => { 
        var zTree = $.fn.zTree.getZTreeObj("treeDemo");
        var nodes = zTree.getNodes();

        function filter(node) {
            console.log("CHECK");
            console.log(node);
            return (node.level == 2 && node.id.indexOf("s")>-1 && node.name == secretMessage);
        }
            
        var st_nodes = zTree.getNodesByFilter(filter); // search the array of the nodes  
       

        for(i=0 ; i < st_nodes.length ; i++){
            var regex = /[^0-9]/g;				// 숫자가 아닌 문자열을 선택하는 정규식
            var ztree_station_seq = st_nodes[i].id.replace(regex, "");
            console.log(st_nodes[i].id);
            console.log(st_nodes[i]);
            $("#diyBtn_"+st_nodes[i].id).click();
        }

        // progress_info = "marker";
        // console.log(secretMessage);
        // for (let i = 0; i < kakao_markers.length; ++i) {
        //     kakao_markers[i].infowindow.close();
        // }
        // marker.infowindow.open(kakao_map, marker);

        // console.log(secretMessage)
        // station_id = secretMessage_id
        // today = new Date();   
  
   
        // var year = today.getFullYear(); // 년도
        // var month = ('0'+ (today.getMonth() + 1)).slice(-2);  // 월
        // var date = ('0' + today.getDate()).slice(-2);  // 날짜 (“0” + this.getDate()).slice(-2);
        // selectday = year+'-'+month+'-'+date
        // $('#current_date').text(year+'-'+month+'-'+date)
        // $("#station_nav").text(secretMessage)
        // $("#station_name").text(secretMessage)
        // selectgraph()

    });

    marker.addListener("mouseover", () => {        
        console.log(secretMessage);
        for (let i = 0; i < kakao_markers.length; ++i) {
            kakao_markers[i].infowindow.close();
        }
        marker.infowindow.open(kakao_map, marker);

     
    });

    marker.addListener("mouseout", () => {        
        console.log(secretMessage);
        for (let i = 0; i < kakao_markers.length; ++i) {
            kakao_markers[i].infowindow.close();
        }
        marker.infowindow.close(kakao_map, marker);

        
    });
}


// kakao map 관련
// 지도타입 컨트롤의 지도 또는 스카이뷰 버튼을 클릭하면 호출되어 지도타입을 바꾸는 함수입니다
function setMapType(maptype) { 
    var roadmapControl = document.getElementById('btnRoadmap');
    var skyviewControl = document.getElementById('btnSkyview'); 
    if (maptype === 'roadmap') {
        kakao_map.setMapTypeId(kakao.maps.MapTypeId.ROADMAP);    
        roadmapControl.className = 'selected_btn';
        skyviewControl.className = 'btn';
    } else {
        kakao_map.setMapTypeId(kakao.maps.MapTypeId.HYBRID);    
        skyviewControl.className = 'selected_btn';
        roadmapControl.className = 'btn';
    }
}

// 지도 확대, 축소 컨트롤에서 확대 버튼을 누르면 호출되어 지도를 확대하는 함수입니다
function zoomIn() {
    kakao_map.setLevel(kakao_map.getLevel() - 1);
}

// 지도 확대, 축소 컨트롤에서 축소 버튼을 누르면 호출되어 지도를 확대하는 함수입니다
function zoomOut() {
    kakao_map.setLevel(kakao_map.getLevel() + 1);
}



// function linegraph(){

//     new Chart(
//         document.getElementById('myChart01'),
//         config
//       );
// }


//이미지(png)로 다운로드
function downImg(){
    window.scrollTo(0,0)
    // var imagediv = document.getElementById("linechart")
    // var _transform = imagediv.style.transform;
    // console.log(_transform)
    // console.log(imagediv)

    // imagediv.style.setProperty("transform", "none")

    html2canvas($('#linechart')[0]).then(function(canvas){
        var todate = new Date();
        
        
        var myImage = canvas.toDataURL('image/png');
        downloadURI(myImage, todate +selectday +".png") 
    });
    // imagediv.style._transform
}

function downImg_jpg(){
    window.scrollTo(0,0)

    html2canvas($('#linechart')[0]).then(function(canvas){
        var todate = new Date();
        
        
        var myImage = canvas.toDataURL('image/png');
        downloadURI(myImage, todate +selectday +".jpg") 
    });
    // imagediv.style._transform
}

function downloadURI(uri, name){
    var link = document.createElement("a")
    link.download = name;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
}

function pdf_save() { // pdf저장 button id
    window.scrollTo(0,0)
    html2canvas($('#linechart')[0]).then(function(canvas) { //저장 영역 div id
    
    // 캔버스를 이미지로 변환
    var imgData = canvas.toDataURL('image/png');
         
    var imgWidth = 190; // 이미지 가로 길이(mm) / A4 기준 210mm
    var pageHeight = imgWidth * 1.414;  // 출력 페이지 세로 길이 계산 A4 기준
    var imgHeight = canvas.height * imgWidth / canvas.width;
    var heightLeft = imgHeight;
    var margin = 10; // 출력 페이지 여백설정
    var doc = new jsPDF('p', 'mm');
    var position = 0;
       
    // 첫 페이지 출력
    doc.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
         
    // 한 페이지 이상일 경우 루프 돌면서 출력
    while (heightLeft >= 20) {
        position = heightLeft - imgHeight;
        doc.addPage();
        doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
    }

    var todate = new Date();
 
    // 파일 저장
    doc.save(selectday+'file-name.pdf');

})};


function satellite(){
    window.location.href = "Monitoring03?station_id="+station_id+"&selectday="+selectday+"&treenode_tid="+treenode_tid;

//    if(selectst){
//         window.location.href = "Monitoring03?station_id="+selectst;
//    }else{
//         window.location.href = "Monitoring03?station_id="+edit_data[0].station_id;
//    }
    
}

function xyzllh ( xvec ){

    var  dtr =  Math.PI/180.0;
    var  flatgc,flatn,dlat;
    var  rnow,rp;
    var  x,y,z,p;
    var  tangc,tangd;

    var  testval,kount;

    var  rn,esq;
    var  clat,slat;
    var  rrnrm = new Array(3);

    var  flat,flon,altkm;
    var  llhvec = new Array(3);


    geodGBL();

    esq    =  EARTH_Esq;

    x      = xvec[0];
    y      = xvec[1];
    z      = xvec[2];

    x      = Number(x);
    y      = Number(y);
    z      = Number(z);

    rp     = Math.sqrt ( x*x + y*y + z*z );

    flatgc = Math.asin ( z/rp )/dtr;

    testval= Math.abs(x) + Math.abs(y);
    if ( testval < 1.0e-10)
        {flon = 0.0 }
    else
        {flon = Math.atan2 ( y,x )/dtr } 
    if (flon < 0.0 )  { flon = flon + 360.0 }

    p      =  Math.sqrt( x*x + y*y );

//            on pole special case

    if ( p < 1.0e-10 )
    {  
        flat = 90.0
        if ( z < 0.0 ) { flat = -90.0 }

        altkm = rp - rearth(flat);
        llhvec[0]  = flat;
        llhvec[1]  = flon;
        llhvec[2]  = altkm;

        return  llhvec;
    }

//       first iteration, use flatgc to get altitude 
//       and alt needed to convert gc to gd lat.

    rnow  =  rearth(flatgc);
    altkm =  rp - rnow;
    flat  =  gc2gd (flatgc,altkm);
        
    rrnrm =  radcur(flat);
    rn    =  rrnrm[1];

    for ( var kount = 0; kount< 5 ; kount++ )
    {
        slat  =  Math.sin(dtr*flat);
        tangd =  ( z + rn*esq*slat )/p;
        flatn =  Math.atan(tangd)/dtr;

        dlat  =  flatn - flat;
        flat  =  flatn;
        clat  =  Math.cos( dtr*flat );

        rrnrm =  radcur(flat);
        rn    =  rrnrm[1];

        altkm =  (p/clat) - rn;

        if ( Math.abs(dlat) < 1.0e-12 ) { break }

    }
    
        llhvec[0]  = flat;
        llhvec[1]  = flon;
        llhvec[2]  = altkm;

        return  llhvec ;

}

function  rearth (lati){
    var    rrnrm, r,lat

    lat   =  Number(lati);

    rrnrm =  radcur ( lat );
    r     =  rrnrm[0];

    return ( r );

}

function  radcur(lati){

     var rrnrm = new Array(3)

     var dtr   = Math.PI/180.0

     var  a,b,lat
     var  asq,bsq,eccsq,ecc,clat,slat
     var  dsq,d,rn,rm,rho,rsq,r,z

     geodGBL();

     a     = EARTH_A;
     b     = EARTH_B;

     asq   = a*a;
     bsq   = b*b;
     eccsq  =  1 - bsq/asq;
     ecc = Math.sqrt(eccsq);

     lat   =  Number(lati);

     clat  =  Math.cos(dtr*lat);
     slat  =  Math.sin(dtr*lat);

     dsq   =  1.0 - eccsq * slat * slat;
     d     =  Math.sqrt(dsq);

     rn    =  a/d;
     rm    =  rn * (1.0 - eccsq )/dsq;

     rho   =  rn * clat;
     z     =  (1.0 - eccsq ) * rn * slat;
     rsq   =  rho*rho + z*z;
     r     =  Math.sqrt( rsq );

     rrnrm[0]  =  r;
     rrnrm[1]  =  rn;
     rrnrm[2]  =  rm;

     return ( rrnrm );

}

function  gc2gd (flatgci, altkmi ){

     var dtr   = Math.PI/180.0;
     var rtd   = 1/dtr;

     var  flatgd,flatgc,altkm
     var  rrnrm = new Array(3)
     var  re,rn,ecc, esq;
     var  slat,clat,tlat
     var  altnow,ratio

     geodGBL();

     flatgc=  Number(flatgci);
     altkm =  Number(altkmi);
     
     ecc   =  EARTH_Ecc;
     esq   =  ecc*ecc;

     altnow  =  altkm;

     rrnrm   =  radcur (flatgc);
     rn      =  rrnrm[1];
     
     ratio   = 1 - esq*rn/(rn+altnow);

     tlat    = Math.tan(dtr*flatgc)/ratio;
     flatgd  = rtd * Math.atan(tlat);


     rrnrm   =  radcur ( flatgd );
     rn      =  rrnrm[1];

     ratio   =  1  - esq*rn/(rn+altnow)
     tlat    =  Math.tan(dtr*flatgc)/ratio;
     flatgd  =  rtd * Math.atan(tlat);

     return  flatgd

}

function geodGBL(){

     var  tstglobal

     tstglobal = typeof EARTH_A;
     if ( tstglobal == "undefined" )  wgs84() 
}

function wgs84(){
          var  wgs84a, wgs84b, wgs84f

          wgs84a         =  6378137;
          wgs84f         =  1.0/298.257223563;
          wgs84b         =  wgs84a * ( 1.0 - wgs84f );

          earthcon (wgs84a, wgs84b );

}    

function earthcon(ai,bi){
           var  f,ecc, eccsq, a,b

           a        =  Number(ai);
           b        =  Number(bi);

           f        =  1-b/a;
           eccsq    =  1 - b*b/(a*a);
           ecc      =  Math.sqrt(eccsq);

           EARTH_A  =  a;
           EARTH_B  =  b;
           EARTH_F  =  f;
           EARTH_Ecc=  ecc;
           EARTH_Esq=  eccsq;
}

function selectgraph(){
    
    console.log("들어옴들어옴들어옴ㅍ들어옴들어옴들어옴들어옴들어옴들어옴들어옴들어옴들어옴들어옴들어옴", graph_count)
    console.log(selectday)
    let lsdytoday =  new Date(parseInt(selectday.substr(0,4)), parseInt(selectday.substr(5,7))-1, parseInt(selectday.substr(8,10))+1, 0, 0, 0, 0);
    // console.log(lsdytoday)
    let lastyear = lsdytoday.getFullYear(); // 년도
    let lastmonth = ('0'+ (lsdytoday.getMonth() + 1)).slice(-2);  // 월
    let lastdate = ('0' + (lsdytoday.getDate())).slice(-2); 
    let lastday = lastyear+'-'+lastmonth+'-'+lastdate

    // console.log(lastday)


    // let testtest =  "-0.00200,-0.00450,-0.00262,-0.00323,-0.00234,-0.00352,-0.00247,-0.00367,-0.00342,-0.00458,-0.00505,-0.00316,-0.00384,-0.00483,-0.00330,-0.00238,-0.00153,-0.00246,-0.00018,-0.00008,-0.00334,-0.00535,-0.00484,-0.00488,-0.00487,-0.00470,-0.00511,-0.00412,-0.00371,-0.00233,-0.00460,-0.00429,-0.00558,-0.00439,-0.00340,-0.00438,-0.00433,-0.00305,-0.00200,-0.00213,-0.00363,-0.00492,-0.00259,-0.00207,-0.00209,-0.00303,-0.00493,-0.00511,-0.00366,-0.00451,-0.00334,-0.00236,-0.00294,-0.00288,-0.00273,-0.00535,-0.00517,-0.00324,-0.00169,-0.00297"
    // console.log(testtest.indexOf(','))

    graphlabel = [];
    data_E =[];
    data_N =[];
    data_U =[];

    var data_E_udp1 = [];
    var data_N_udp1 = [];
    var data_U_udp1 = [];

    var data_E_udp2 = [];
    var data_N_udp2 = [];
    var data_U_udp2 = [];
    
    var data_E_udp3 = [];
    var data_N_udp3 = [];
    var data_U_udp3 = [];

   
   
    $.ajax({
        type: "POST",
        url: "/monitoring/data",
        async : false,
		data : {
			station_id : station_id,
            monitoring_date : selectday,
            lastday : lastday,
            graph_count : graph_count
		},
        success : function(json) {
            edit_data = json.data;

            console.log(edit_data)

            if(edit_data.length > 0){

                let selectcurrentday = edit_data[0].monitoring_date

                let year = selectcurrentday.substr(0, 4)
                let month = selectcurrentday.substr(5, 2)
                let date = selectcurrentday.substr(8, 2)

                console.log(year+'-'+month+'-'+date)

                $('#current_date').text(year+'-'+month+'-'+date)
            }
            


            for(var i = 0; i < edit_data.length; i++){
                if(graphlabel.indexOf(edit_data[i].monitoring_date.substr(11, 8)) == -1 ){
                    graphlabel.push(edit_data[i].monitoring_date.substr(11, 8))

                    data_E_udp1.push({'x': edit_data[i].monitoring_date.substr(11, 8), 'y': null})
                    data_N_udp1.push({'x': edit_data[i].monitoring_date.substr(11, 8), 'y': null})
                    data_U_udp1.push({'x': edit_data[i].monitoring_date.substr(11, 8), 'y': null})

                    data_E_udp2.push({'x': edit_data[i].monitoring_date.substr(11, 8), 'y': null})
                    data_N_udp2.push({'x': edit_data[i].monitoring_date.substr(11, 8), 'y': null})
                    data_U_udp2.push({'x': edit_data[i].monitoring_date.substr(11, 8), 'y': null})

                    data_E_udp3.push({'x': edit_data[i].monitoring_date.substr(11, 8), 'y': null})
                    data_N_udp3.push({'x': edit_data[i].monitoring_date.substr(11, 8), 'y': null})
                    data_U_udp3.push({'x': edit_data[i].monitoring_date.substr(11, 8), 'y': null})


                }
                
            }
            

            for(let j=0; j<graphlabel.length; j++){

                for(let i=0; i < edit_data.length; i++){
                    if(graphlabel[j] == edit_data[i].monitoring_date.substr(11, 8)){
                        
                        if(edit_data[i].monitoring_udp_port == '65001'){       
                            let idx = graphlabel.indexOf(edit_data[i].monitoring_date.substr(11, 8))       
                            // console.log(idx)
                            // console.log(data_E_udp1[idx])

                            if(idx != -1){
                                data_E_udp1[idx].y = edit_data[i].monitoring_E
                                data_N_udp1[idx].y = edit_data[i].monitoring_N
                                data_U_udp1[idx].y = edit_data[i].monitoring_U

                                data_E_udp1[graphlabel.length-1].y = edit_data[i].monitoring_E
                                data_N_udp1[graphlabel.length-1].y = edit_data[i].monitoring_N
                                data_U_udp1[graphlabel.length-1].y = edit_data[i].monitoring_U

                            }
                            if(!data_E_udp1[0].y){
                                console.log("whwo")
                                data_E_udp1[0].y = edit_data[i].monitoring_E

                            }
                            if(!data_N_udp1[0].y){
                                console.log("whwo")
                                data_N_udp1[0].y = edit_data[i].monitoring_N           
                            }
                            if(!data_U_udp1[0].y){
                                console.log("whwo")
                                data_U_udp1[0].y = edit_data[i].monitoring_U

                            }
                            
                            
                            
                        }else if(edit_data[i].monitoring_udp_port == '65003'){
                            let idx = graphlabel.indexOf(edit_data[i].monitoring_date.substr(11, 8))       

                            if(idx != -1){
                               
                                data_E_udp2[idx].y = edit_data[i].monitoring_E
                                data_N_udp2[idx].y = edit_data[i].monitoring_N
                                data_U_udp2[idx].y = edit_data[i].monitoring_U

                                data_E_udp2[graphlabel.length-1].y = edit_data[i].monitoring_E
                                data_N_udp2[graphlabel.length-1].y = edit_data[i].monitoring_N
                                data_U_udp2[graphlabel.length-1].y = edit_data[i].monitoring_U

                            }
                            if(!data_E_udp2[0].y){
                                console.log("whwo")
                                data_E_udp2[0].y = edit_data[i].monitoring_E

                            }
                            if(!data_N_udp2[0].y){
                                console.log("whwo")
                                data_N_udp2[0].y = edit_data[i].monitoring_N           
                            }
                            if(!data_U_udp2[0].y){
                                console.log("whwo")
                                data_U_udp2[0].y = edit_data[i].monitoring_U

                            }
                            

                        }else if(edit_data[i].monitoring_udp_port == '65005'){

                            let idx = graphlabel.indexOf(edit_data[i].monitoring_date.substr(11, 8))       
                       
                            if(idx != -1){
                                data_E_udp3[idx].y = edit_data[i].monitoring_E
                                data_N_udp3[idx].y = edit_data[i].monitoring_N
                                data_U_udp3[idx].y = edit_data[i].monitoring_U

                                data_E_udp3[graphlabel.length-1].y = edit_data[i].monitoring_E
                                data_N_udp3[graphlabel.length-1].y = edit_data[i].monitoring_N
                                data_U_udp3[graphlabel.length-1].y = edit_data[i].monitoring_U

                            }
                            if(!data_E_udp3[0].y){
                                console.log("whwo")
                                data_E_udp3[0].y = edit_data[i].monitoring_E

                            }
                            if(!data_N_udp3[0].y){
                                console.log("whwo")
                                data_N_udp3[0].y = edit_data[i].monitoring_N           
                            }
                            if(!data_U_udp3[0].y){
                                console.log("whwo")
                                data_U_udp3[0].y = edit_data[i].monitoring_U

                            }
                        }
                    }
                    

                }

                

            }
        
            for(var i = 0; i < edit_data.length; i++){

                data_E.push(edit_data[i].monitoring_E)
                data_N.push(edit_data[i].monitoring_N)
                data_U.push(edit_data[i].monitoring_U)


            }
        
            
        },
        error: function(error){
            // console.log(error)
        }
    });

    

    let data_E_min = Math.round(Math.min(...data_E)*1000)/1000
    let data_E_max = Math.round(Math.max(...data_E)*1000)/1000
    let data_N_min = Math.round(Math.min(...data_N)*1000)/1000
    let data_N_max = Math.round(Math.max(...data_N)*1000)/1000
    let data_U_min = Math.round(Math.min(...data_U)*1000)/1000
    let data_U_max = Math.round(Math.max(...data_U)*1000)/1000
  
    if(data_E_min%0.002==0){
        data_E_min = Math.round((data_E_min - parseFloat(0.002))*1000)/1000
       
    }else{
        data_E_min = Math.round((data_E_min - parseFloat(0.001))*1000)/1000
        
    }
    if(data_N_min%0.002==0){
       
        data_N_min = Math.round((data_N_min - parseFloat(0.002))*1000)/1000
        
    }else{
        data_N_min = Math.round((data_N_min - parseFloat(0.001))*1000)/1000
       
    }
    if(data_U_min%0.002==0){
        data_U_min = Math.round((data_U_min - parseFloat(0.002))*1000)/1000
        
    }else{
        data_U_min = Math.round((data_U_min - parseFloat(0.001))*1000)/1000
       
    }
    if(data_E_max%0.002==0){
        data_E_max = Math.round((data_E_max + parseFloat(0.002))*1000)/1000
        
    }else{
        data_E_max = Math.round((data_E_max + parseFloat(0.001))*1000)/1000
        
    }
    if(data_N_max%0.002==0){
        data_N_max = Math.round((data_N_max + parseFloat(0.002))*1000)/1000
        
    }else{
        data_N_max = Math.round((data_N_max + parseFloat(0.001))*1000)/1000
        
    }
    if(data_U_max%0.002==0){
        data_U_max = Math.round((data_U_max + parseFloat(0.002))*1000)/1000
        
    }else{
        data_U_max = Math.round((data_U_max + parseFloat(0.001))*1000)/1000
    }

    // console.log(data_E_max)
    // console.log(data_E_min)
    // console.log(data_E_max - data_E_min)
    if(data_E_max - data_E_min < 0.1){
        console.log("eee")
        data_E_max = data_E_max+0.05
        data_E_min = data_E_min-0.05
    }


    datasets_E = [];
    datasets_N = [];
    datasets_U = [];

    datasets_E.push({
        label: 'UDP port1',
        borderColor: '#FF9933',
        data: data_E_udp1,
        borderWidth:1,
        spanGaps : true 
       
    })
    datasets_E.push({
        label: 'UDP port2',
        borderColor: '#FFFF00',
        data: data_E_udp2,
        borderWidth:1,
        spanGaps : true 
       
    })
    datasets_E.push({
        label: 'UDP port3',
        borderColor: '#66FF00',
        data: data_E_udp3,
        borderWidth:1,
        spanGaps : true 
       
    })
    datasets_N.push({
        label: 'UDP port1',
        borderColor: '#FF9933',
        data: data_N_udp1,
        borderWidth:1,
        spanGaps : true 
               
    })
    datasets_N.push({
        label: 'UDP port2',
        borderColor: '#FFFF00',
        data: data_N_udp2,
        borderWidth:1,
        spanGaps : true 
               
    }) 
    datasets_N.push({
        label: 'UDP port3',
        borderColor: '#66FF00',
        data: data_N_udp3,
        borderWidth:1,
        spanGaps : true 
               
    })
    datasets_U.push({
        label: 'UDP port1',
        borderColor: '#FF9933',
        data: data_U_udp1,
        borderWidth:1,
        spanGaps : true 
       
    })
    datasets_U.push({
            label: 'UDP port2',
            borderColor: '#FFFF00',
            data: data_U_udp2,
            borderWidth:1,
            spanGaps : true 
        
    }) 
    datasets_U.push({
            label: 'UDP port3',
            borderColor: '#66FF00',
            data: data_U_udp3,
            borderWidth:1,
            spanGaps : true 
        
    })
    
    config_E= {
        type: 'line',
        data: {
            // labels: graphlabel,
            datasets: datasets_E,
            
        },
        options: {
            responsive : false,
            layout: {
                padding: {
                    right: 10
                }
            },
            scales: {
                y: {min: data_E_min,
                    max: data_E_max,
                    ticks:{
                        stepSize : 0.002,
                        color: "#FFFFFF",
                        // callback: function(value, index, values) {
                        //     value = value+' m'
                        //             return  value;}
                        callback: function(val, index) {
                                // Hide every 2nd tick label
                                return index % 1 === 0 ? this.getLabelForValue(val) : '';
                        },
                    },
                    afterBuildTicks: function(humdaysChart) {  
                        var now_tick = humdaysChart.ticks;

                        var tick_limit = Math.ceil(now_tick.length/7);
                        humdaysChart.ticks = [];

                        for(i=0;i<now_tick.length;i++){
                            if( (i % tick_limit) == 0){
                                humdaysChart.ticks.push(now_tick[i]);
                            }
                        }
                    },
                    grid : {
                        color : "#616161"
                    },
                    afterFit: function(scaleInstance) {
                        scaleInstance.width = 80; // sets the width to 100px
                      }
                
                },
                x: {
                    ticks: {
                        // autoSkip: false,
                        maxRotation: 0,
                        color: "#FFFFFF",
                    },
                    afterBuildTicks: function(humdaysChart) {  
                        var now_tick = humdaysChart.ticks;

                        var tick_limit = Math.ceil(now_tick.length/5);
                        humdaysChart.ticks = [];

                        for(i=0;i<now_tick.length;i++){
                            if( (i % tick_limit) == 0){
                                humdaysChart.ticks.push(now_tick[i]);
                            }
                        }
                    },
                    grid : {
                        color : "#616161"
                    },
                    // afterBuildTicks: function(humdaysChart) {  
                    //     console.log(humdaysChart.ticks);
                    //     var now_tick = humdaysChart.ticks;

                    //     var tick_limit = Math.ceil(now_tick.length/4);
                    //     console.log(tick_limit);
                    //     humdaysChart.ticks = [];

                    //     for(i=0;i<now_tick.length;i++){
                    //         if( (i % tick_limit) == 0){
                    //             humdaysChart.ticks.push(now_tick[i]);
                    //         }
                    //     }
                    //     console.log(humdaysChart.ticks);
                    // }
                }
            },
            plugins: {
                legend: {
                    display: false,
                    // text: 'Custom Chart Title'
                },
                title: {
                    display:true,
                    color:'#FFFFFF',
                    text:"East[m]",
                    position: 'left'
                },
                tooltip: {
                    enabled: true,
                    callbacks: {
                        label: function(context) {

                            var labels = "";
                            labels = context.dataset.label+  "\n" +context.parsed.y
                            return labels;
                        }
                    }
                    
                },
            },
            elements: {
                point:{
                    radius: 0
                }
            }
            
        }
    };

    config_N = {
        type: 'line',
        data: {
            // labels: graphlabel,
            datasets: datasets_N,
        },
        options: {
            // showLine: false,
            responsive : false,
            layout: {
                padding: {
                    right: 10
                }
            },
            scales: {
                y: {
                    min: data_N_min,
                    max: data_N_max,
                    ticks:{
                        stepSize : 0.002,
                        color: "#FFFFFF",
                        callback: function(val, index) {
                            // Hide every 2nd tick label
                            return index % 1 === 0 ? this.getLabelForValue(val) : '';
                         },
                        // callback: function(value, index, values) {
                        //     value = value+' m'
                        //             return  value;}
                    },
                    afterBuildTicks: function(humdaysChart) {  
                        var now_tick = humdaysChart.ticks;

                        var tick_limit = Math.ceil(now_tick.length/7);
                        humdaysChart.ticks = [];

                        for(i=0;i<now_tick.length;i++){
                            if( (i % tick_limit) == 0){
                                humdaysChart.ticks.push(now_tick[i]);
                            }
                        }
                    },
                    grid : {
                        color : "#616161"
                    },
                    afterFit: function(scaleInstance) {
                        scaleInstance.width = 80; // sets the width to 100px
                      }
                },
                x: {
                    ticks: {
                        // autoSkip: false,
                        maxRotation: 0,
                        color: "#FFFFFF",
                    },
                    afterBuildTicks: function(humdaysChart) {  
                        var now_tick = humdaysChart.ticks;

                        var tick_limit = Math.ceil(now_tick.length/5);
                        humdaysChart.ticks = [];

                        for(i=0;i<now_tick.length;i++){
                            if( (i % tick_limit) == 0){
                                humdaysChart.ticks.push(now_tick[i]);
                            }
                        }
                    },
                    grid : {
                        color : "#616161"
                    }
                }
            },
            plugins: {
                legend: {
                    display: false,
                    // text: 'Custom Chart Title'
                },
                title: {
                    display:true,
                    color:'#FFFFFF',
                    text:"North[m]",
                    position: 'left'
                },
                tooltip: {
                    enabled: true,
                    callbacks: {
                        label: function(context) {

                            var labels = "";
                            labels = context.dataset.label+  "\n" +context.parsed.y
                            return labels;
                        }
                    }
                    
                },
            },
            elements: {
                point:{
                    radius: 0
                }
            }
            
        }
    };

    config_U = {
        type: 'line',
        data: {
            // labels: graphlabel,
            datasets: datasets_U,
        },
        options: {
            responsive : false,
            layout: {
                padding: {
                    right: 10
                }
            },
            scales: {
                y: {
                    min: data_U_min,
                    max: data_U_max,
                    ticks:{
                        stepSize : 0.002,
                        color: "#FFFFFF",
                        callback: function(val, index) {
                            // Hide every 2nd tick label
                            return index % 1 === 0 ? this.getLabelForValue(val) : '';
                        },
                        // callback: function(value, index, values) {
                        //     value = value+' m'
                        //             return  value;}
                    },
                    afterBuildTicks: function(humdaysChart) {  
                        var now_tick = humdaysChart.ticks;
                        console.log("now_tick", now_tick)
                        var tick_limit = Math.ceil(now_tick.length/7);
                        humdaysChart.ticks = [];

                        for(i=0;i<now_tick.length;i++){
                            if( (i % tick_limit) == 0){
                                humdaysChart.ticks.push(now_tick[i]);
                            }
                        }
                        console.log("humdaysChart", humdaysChart.ticks)
                    },
                    grid : {
                        color : "#616161"
                    },
                    afterFit: function(scaleInstance) {
                        scaleInstance.width = 80; // sets the width to 100px
                      }
                },
                x: {
                    ticks: {
                        // autoSkip: false,
                        maxRotation: 0,
                        color: "#FFFFFF",
                    },
                    afterBuildTicks: function(humdaysChart) {  
                        var now_tick = humdaysChart.ticks;

                        var tick_limit = Math.ceil(now_tick.length/5);
                        humdaysChart.ticks = [];

                        for(i=0;i<now_tick.length;i++){
                            if( (i % tick_limit) == 0){
                                humdaysChart.ticks.push(now_tick[i]);
                            }
                        }
                    },
                    grid : {
                        color : "#616161"
                    }
                }
            },
            plugins: {
                legend: {
                    display: false,
                    // text: 'Custom Chart Title'
                },
                title: {
                    display:true,
                    color:'#FFFFFF',
                    text:"Up[m]",
                    position: 'left'
                },
                tooltip: {
                    enabled: true,
                    callbacks: {
                        label: function(context) {

                            var labels = "";
                            labels = context.dataset.label+  "\n" +context.parsed.y
                            return labels;
                        }
                    }
                    
                },
            },
            elements: {
                point:{
                    radius: 0
                }
            },
            animation:{
                onComplete : function(){
                    /*Your code here*/
                    if(progress_info == "marker" || progress_info == "date_btn" || progress_info == "refresh"){
                        $("#spinner_wrap").hide();
                    }
                }
            }
            
        }
    };

    if(myChart01){myChart01.destroy();}
    if(myChart02){myChart02.destroy();}
    if(myChart03){myChart03.destroy();}

    myChart01 = new Chart(
        document.getElementById('myChart01'),
        config_E
    );

    myChart02 = new Chart(
    document.getElementById('myChart02'),
    config_N
    );

    myChart03 = new Chart(
    document.getElementById('myChart03'),
    config_U
    );
    

   

}

function current_satellite(){
  
    var labels_bar = [];
    var data_L1 = [];
    var data_L2 = [];
    var col_L1 = [];
    var col_L2 = [];

    var GPS_r = [];
    var GPS_theta = [];
    var GPS_text = [];
    var GLONASS_r = [];
    var GLONASS_theta = [];
    var GLONASS_text = [];
    var BeiDou_r = [];
    var BeiDou_theta = [];
    var BeiDou_text = [];
    var Galileo_r = [];
    var Galileo_theta = [];
    var Galileo_text = [];
    var QZSS_r = [];
    var QZSS_theta = [];
    var QZSS_text = [];
  
    $.ajax({
        type: "GET",
        url: "/monitoring/station/satellite?station_id="+station_id,
        async : false,
        success : function(json) {
            edit_data = json.data;
            console.log(edit_data)

            for(var i =0; i <edit_data.length; i++){
                labels_bar.push(edit_data[i].satellite_svno)
                data_L1.push(edit_data[i].satellite_L1)
                data_L2.push(edit_data[i].satellite_L2)
                if(edit_data[i].satellite_gnsstyle=='G'){
                    col_L1.push('RGB(0,100,0)')
                    col_L2.push('RGB(180,200,0)')
                    GPS_r.push(edit_data[i].satellite_elevation)
                    GPS_theta.push(edit_data[i].satellite_azimuth)
                    GPS_text.push(edit_data[i].satellite_svno)
                }else if(edit_data[i].satellite_gnsstyle=='E'){
                    col_L1.push('RGB(0,128,128)')
                    col_L2.push('RGB(0,230,230)')
                    Galileo_r.push(edit_data[i].satellite_elevation)
                    Galileo_theta.push(edit_data[i].satellite_azimuth)
                    Galileo_text.push(edit_data[i].satellite_svno)
                }else if(edit_data[i].satellite_gnsstyle=='B'){
                    col_L1.push('RGB(200,0,0)')
                    col_L2.push('RGB(255,128,0)')
                    BeiDou_r.push(edit_data[i].satellite_elevation)
                    BeiDou_theta.push(edit_data[i].satellite_azimuth)
                    BeiDou_text.push(edit_data[i].satellite_svno)
                }else if(edit_data[i].satellite_gnsstyle=='N'){
                    col_L1.push('RGB(0,0,150)')
                    col_L2.push('RGB(0,50,255)')
                    GLONASS_r.push(edit_data[i].satellite_elevation)
                    GLONASS_theta.push(edit_data[i].satellite_azimuth)
                    GLONASS_text.push(edit_data[i].satellite_svno)
                }
                // else if(edit_data[i].satellite_gnsstyle=='Q'){
                //     col_L1.push('RGB(255,255,0)')
                //     col_L2.push('RGB(210,210,0)')
                //     QZSS_r.push(edit_data[i].satellite_elevation)
                //     QZSS_theta.push(edit_data[i].satellite_azimuth)
                //     QZSS_text.push(edit_data[i].satellite_svno)
                // }
                

                
                    
            }
            
        },
        error: function(error){
            console.log(error)
        }
    });

    
    var data_bar = {
    labels: labels_bar,
    datasets: [{
         label: 'L1',
        data: data_L1,
        backgroundColor: col_L1,
        
        
    },
    {
        label: 'L2',
        data: data_L2,
        backgroundColor:col_L2
        
    }]
    };

    const config_bar = {
        type: 'bar',
        data: data_bar,
        options: {
            scales: {
                y: {
                    ticks:{
                        color: "#FFFFFF"
                    },
                    grid : {
                        color : "#616161"
                    }
                },
                x: {
                    ticks:{
                        color: "#FFFFFF"
                    },
                    grid : {
                        color : "#616161"
                    },
                    // categoryPercentage: 1.0,
                    // barPercentage: 0.6,
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'right',
                    // color:'#FFFFFF'
                    labels:{
                        color: '#FFFFFF',
                        boxWidth : 0,
                        font: {
                            size: 20
                        }
                    }
                },
                title: {
                    display:true,
                    color:'#FFFFFF',
                    text:"C/N0 [dB-Hz]",
                    position: 'left'
                },
                
              
            },
            animation:{
                onComplete : function(){
                    /*Your code here*/
                    if(progress_info == "marker" || progress_info == "date_btn" || progress_info == "refresh"){
                        $("#spinner_wrap").hide();
                    }
                }
            }
            

        },
      };

    if(myChart05){myChart05.destroy();}

    myChart05 = new Chart(
        document.getElementById('myChart05'),
        config_bar
    );
    
    // *************** 위성 상단  ***************

    Plotly.purge("myDiv");           // 위성 그래프 초기화

    // 범례 모두 표시하기 위한 유효성 체크
    if(GPS_r.length == 0 || GPS_theta.length == 0){
        GPS_r = [null];
        GPS_theta = [null];
    } else if(GLONASS_r.length == 0 || GLONASS_theta.length == 0){
        GLONASS_r = [null];
        GLONASS_theta = [null];
    } else if(BeiDou_r.length == 0 || BeiDou_theta.length == 0){
        BeiDou_r = [null];
        BeiDou_theta = [null];
    } else if(Galileo_r.length == 0 || Galileo_theta.length == 0){
        Galileo_r = [null];
        Galileo_theta = [null];
    }

    // Plotly.deleteplot('myDiv', 0);
    var GPS = {
        r: GPS_r,
        theta: GPS_theta,
        mode: 'markers+text',
        name: 'GPS',
        text: GPS_text,
        textfont : {
            color : 'rgb(255,255,255)'
        },
        hovertemplate: 'GPS %{r:.2f}, %{theta:.2f}<extra></extra>',
        marker: {
            color: 'RGB(0,100,0)',
            size: 25,
            line: {color: 'white'},
            opacity: 0.7
        },
        type: 'scatterpolar'
    };
        
    var GLONASS = {
        r: GLONASS_r,
        theta: GLONASS_theta,
        text: GLONASS_text,
        textfont : {
            color : 'rgb(255,255,255)'
        },
        mode: 'markers+text',
        name: 'GLONASS',
        hovertemplate: 'GLONASS %{r:.2f}, %{theta:.2f}<extra></extra>',
        marker: {
            color: 'RGB(0,0,150)',
            size: 25,
            line: {color: 'white'},
            opacity: 0.7
        },
        type: 'scatterpolar'
    };
        
    var BeiDou = {
        r: BeiDou_r,
        theta: BeiDou_theta,
        text:BeiDou_text,
        textfont : {
            color : 'rgb(255,255,255)'
        },
        mode: 'markers+text',
        name: 'BeiDou',
        hovertemplate: 'BeiDou %{r:.2f}, %{theta:.2f}<extra></extra>',
        marker: {
            color: 'RGB(200,0,0)',
            size: 25,
            line: {color: 'white'},
            opacity: 0.7
        },
        type: 'scatterpolar'
    };
        
    var Galileo = {
        r: Galileo_r,
        theta: Galileo_theta,
        text: Galileo_text,
        textfont : {
            color : 'rgb(255,255,255)'
        },
        mode: 'markers+text',
        name: 'Galileo',
        hovertemplate: 'Galileo %{r:.2f}, %{theta:.2f}<extra></extra>',
        marker: {
            color: 'RGB(0,128,128)',
            size: 25,
            line: {color: 'white'},
            opacity: 0.7
        },
        type: 'scatterpolar'
    };
        
    var circle_width = "";
    if (matchMedia("screen and (min-width: 320px) and (max-width:768px) and ( orientation: portrait )").matches) { 
        circle_width = $(".chart_right").width();
        console.log(circle_width);
    } else {
        circle_width = 553;
    }
        
    var data = [GPS, GLONASS, BeiDou, Galileo];
    
    var layout = {
        font: {size: 15},
        paper_bgcolor: 'rgb(119, 119, 119)',
        plot_bgcolor: 'rgb(119, 119, 119)',
        polar : {
            bgcolor: 'rgb(119, 119, 119)',
            angularaxis: {
                color: 'rgb(255,255,255)',
                tickcolor: 'rgb(255,255,255)',     
                // tickcolor: 'rgb(253,253,253)',     
                rotation : 90,                      //  회전 각도 (0도를 위쪽으로)
                direction : "clockwise"             //  회전 방향 (시계방향으로 0~360)
            },
            radialaxis: {
                showticklabels: false,
                color: 'rgb(255,255,255)',
                angle : 0,                         // 라벨 선 그려지는 각도
                autorange : false,                  // 자동 범위 조절 (false : 끔)
                range : [90,0]
            },
        },
        autosize: false,
        width: circle_width,
        height: 349,
        margin: {
            l: 30,
            r: 20,
            b: 30,
            t: 30,
            pad: 4
        },
        showlegend : true,
        legend : {
            font : {
                color : 'rgb(255,255,255)'
            },
        }
    
        
    };

    Plotly.plot('myDiv', data, layout,{displayModeBar: false});
}



function editData(){
    window.location.href = "Monitoring02?station_id="+station_id+"&selectday="+selectday+"&treenode_tid="+treenode_tid;

}

function getmapinfo(){

    if(!location_id){
        $.ajax({
            type: "POST",
            url: "/station/search",
            async : false,
            success : function(json) {
                
                edit_data = json.data;
                // find_station_edit_data = edit_data
                // console.log(find_station_edit_data)
    
                // $('#project_name').text(edit_data[0].project_name)
                // $('#station_name').text(edit_data[0].station_name)
                // $("#project_nav").text(' > '+edit_data[0].project_name + ' > ' +edit_data[0].location_name + ' > '+edit_data[0].station_name)
            
                location_id = edit_data[0].location_id
                // station_id = edit_data[0].station_id
                // station_udp1 = edit_data[0].station_udp1
                // station_udp2 = edit_data[0].station_udp2
                // station_udp3 = edit_data[0].station_udp3
                
            },
            error: function(json){
                console.log("ztree data loading error")
            }
        });
    }

    station_list = []
    mapinfodata=[]
    $.ajax({
        type: "GET",
        url: "/station/mapinfo?location_id="+location_id,
        async : false,
        success : function(json) {
            edit_data = json.data;

            // console.log(edit_data)
            for(var i = 0; i < edit_data.length; i++){
                if(station_list.indexOf(edit_data[i].station_id) == -1){
                    station_list.push(edit_data[i].station_id)

                    var xyz_array = [(edit_data[i].monitoring_X), (edit_data[i].monitoring_Y), (edit_data[i].monitoring_Z)];
              
                    var result = xyzllh(xyz_array);
                    mapinfodata.push({name : edit_data[i].station_name, lat : result[0], lng : result[1], id : edit_data[i].station_id})
                }
                
         
            }
    

        },
        error: function(json){
            // alert("getmapinfo data loading error")
            console.log("getmapinfo data loading error")
            console.log("location_id", location_id)
            console.log(json)
        }
    });
}




function getrandom(num , mul){
var value = [ ]	
    for(i=0;i<=num;i++)
{
    rand = Math.random() * mul;
value.push(rand);
}
    return value;
}
        
function current_station_info(){
   
    $.ajax({
        type: "GET",
        url: "/station/edit/selected?station_id="+station_id,
        async : false,
        success : function(json) {
            edit_data = json.data;
   
            station_udp1 = edit_data[0].station_udp1
            station_udp2 = edit_data[0].station_udp2
            station_udp3 = edit_data[0].station_udp3

            
        },
        error: function(json){
            console.log("current_station_info loading error")
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
            // console.log("IN BLUE!!");
            $("#diyBtn_"+st_nodes[i].id).attr('src','/static/images/btn_blue.png')
        } else {
            // console.log("IN RED!!");
            $("#diyBtn_"+st_nodes[i].id).attr('src','/static/images/btn_red.png')
        }
    }
}


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