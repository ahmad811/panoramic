	var imgLoc = "images/";/*"https://intosite.plm.automation.siemens.com/CardboardUploader/";*/

        var optionsArr=[{imageURL: imgLoc+"DSC_1.jpg", x:10, y:0, z:100, centerHeading: 0, direction: 45, name:"DSC_1"},
                        {imageURL: imgLoc+"DSC_2.jpg", x:50, y:0, z:150, centerHeading: 0, direction: -45, name:"DSC_2"},
                        {imageURL: imgLoc+"DSC_3.jpg", x:70, y:0, z:260, centerHeading: 0, direction: 180, name:"DSC_3"},
                        {imageURL: imgLoc+"DSC_4.jpg", x:250, y:0, z:10, centerHeading: 0, direction: 45, name:"DSC_4"},
                        {imageURL: imgLoc+"DSC_5.jpg", x:450, y:0, z:50, centerHeading: 0, direction: 90, name:"DSC_5"},
                        //{imageURL: imgLoc+"DSC_6.jpg", x:500, y:0, z:390, centerHeading: 0, direction: 45, name:"DSC_6"},
                        //{imageURL: imgLoc+"DSC_6.jpg", x:300, y:0, z:120,centerHeading: 0, direction: -45, name:"DSC_6"}
						];
        function initialize() {

            var panoOptions = { options: optionsArr[1], selectionCallback: linkSelectionCallback };
            var pano = new IntoSite.PanoramaViewer(document.getElementById('pano-canvas'), panoOptions);
            //put the link object

            var links = [{ options: optionsArr[2], selectionCallback: linkSelectionCallback},
                         { options: optionsArr[0], selectionCallback: linkSelectionCallback },
                         { options: optionsArr[3], selectionCallback: linkSelectionCallback }]
            pano.setLinks(links);
        }

        var linkSelectionCallback = function (selectedLinkObject, pano) {
            var ind1, ind2, ind3;
            rand(optionsArr.length,function(ind1,ind2,ind3){
            //var ind1 = Math.floor(Math.random() * 6);
            //var ind2 = Math.floor(Math.random() * 6);
            //var ind3 = Math.floor(Math.random() * 6);
            var newLinks = [
            { options:  optionsArr[ind1], selectionCallback: linkSelectionCallback},
            { options:  optionsArr[ind2], selectionCallback: linkSelectionCallback },
            { options: optionsArr[ind3], selectionCallback: linkSelectionCallback }]
            pano.setLinks(newLinks);
            });
        }
        var rand = function(max, callback) {
            var i1 = Math.floor(Math.random() * max);
            var i2 = Math.floor(Math.random() * max);
            while(i2==i1) {
                i2 = Math.floor(Math.random() * max);
            }
            var i3 = Math.floor(Math.random() * max);
            while(i3==i2 || i3==i1) {
                i3 = Math.floor(Math.random() * max);
            }
            callback(i1,i2,i3);
        }
		
		document.addEventListener("DOMContentLoaded", function(event) {
			initialize();
		},false);
		