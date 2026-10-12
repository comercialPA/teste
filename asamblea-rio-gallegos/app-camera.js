(()=>{
  'use strict';

  const $=id=>document.getElementById(id);

  function mergeCapturedFile(mainInput,file){
    if(!mainInput||!file)return false;
    try{
      const transfer=new DataTransfer();
      Array.from(mainInput.files||[]).forEach(existing=>transfer.items.add(existing));
      transfer.items.add(file);
      mainInput.files=transfer.files;
      mainInput.dispatchEvent(new Event('change',{bubbles:true}));
      return true;
    }catch(err){
      console.warn('[CAMERA MERGE]',err);
      return false;
    }
  }

  function ensureCameraUi(){
    const mainInput=$('fileInput');
    const choose=$('btnChooseFiles');
    const zone=$('dropZone');
    if(!mainInput||!choose||!zone||$('btnTakePhoto'))return;

    const cameraInput=document.createElement('input');
    cameraInput.id='cameraInput';
    cameraInput.type='file';
    cameraInput.accept='image/*';
    cameraInput.setAttribute('capture','environment');
    cameraInput.tabIndex=-1;
    cameraInput.setAttribute('aria-hidden','true');
    cameraInput.className='camera-native-input';

    const actions=document.createElement('div');
    actions.className='camera-source-actions';

    const take=document.createElement('button');
    take.id='btnTakePhoto';
    take.type='button';
    take.className='btn btn-primary btn-sm camera-take-btn';
    take.innerHTML='<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 8.5h3l1.4-2.2h7.2L17 8.5h3v10H4z"/><circle cx="12" cy="13.5" r="3.2"/></svg><span>Tomar foto</span>';

    choose.style.marginTop='0';
    choose.classList.add('camera-gallery-btn');
    choose.textContent='Elegir fotos';

    zone.appendChild(cameraInput);
    actions.append(take,choose);
    zone.appendChild(actions);

    take.addEventListener('click',()=>{
      cameraInput.value='';
      cameraInput.click();
    });

    cameraInput.addEventListener('change',()=>{
      const file=cameraInput.files?.[0];
      if(!file)return;
      if(!mergeCapturedFile(mainInput,file)){
        mainInput.click();
      }
      cameraInput.value='';
    });
  }

  function init(){
    ensureCameraUi();
    const upload=$('uploadModal');
    if(upload){
      new MutationObserver(()=>{
        if(upload.classList.contains('open'))ensureCameraUi();
      }).observe(upload,{attributes:true,attributeFilter:['class']});
    }
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
