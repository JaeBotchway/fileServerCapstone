
$(document).ready(function(){
    $("#searchBtn").click(function(){
        let searchTerm = $("#searchTerm");
        $.get(`http://localhost:4001/search?term=${searchTerm.val()}`, function(data, status){
          console.log(data[0])
          let innerHtml="";
          data.forEach(file => {
              innerHtml += ` 
                  <li>${file.title}</li>
                  <li>${file.description}</li>
                  <li><img src=${file.url}></li>
                  <hr>
              
              `
          });
          $('#filesContainer').html(innerHtml)
        });
      });

});