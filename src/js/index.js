$(document).ready(function(){
  $('.base-url').each(function(e,index){
    $(this).html(window.location.href);
  });

  $('#btn-create').click(function(){
    $('#frm-create').submit();
  });

  $('.btn-edit').click(function(){
    let data = $(this).data('info');
    $('#editRepo').modal();
    $('#frm-edit').attr('action','/branch/edit/'+data.uuid).find('input, textarea').each(function(e, index){
      if($(this).attr('name')==='branch'){
        $(this).val(data.branch);
      }else if($(this).attr('name')==='dir'){
        $(this).val(data.baseDirectory);
      }else if($(this).attr('name')==='repo'){
        $(this).val(data.repositoryName);
      }else if($(this).attr('name')==='script'){
        $(this).val(data.script);
      }
    });
  });

  $('#btn-save').click(function(){
    $('#frm-edit').submit();
  });
});
