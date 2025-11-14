// front-end interaction for GenZbot
document.addEventListener('DOMContentLoaded',()=>{
  const articleForm = document.getElementById('articleForm');
  const generateBtn = document.getElementById('generateBtn');
  const topicInput = document.getElementById('topic');
  const audienceInput = document.getElementById('audience');
  const toneSelect = document.getElementById('tone');
  const lengthSelect = document.getElementById('length');
  const loading = document.getElementById('loading');
  const generatedPre = document.getElementById('generated');
  const copyBtn = document.getElementById('copyBtn');
  const regenerateBtn = document.getElementById('regenerateBtn');
  const shareBtn = document.getElementById('shareBtn');
  const jumpBtn = document.getElementById('jumpToForm');
  const yearEl = document.getElementById('year');

  yearEl.textContent = new Date().getFullYear();

  // scroll to form when clicking 'Generate now'
  jumpBtn.addEventListener('click', (e)=>{
    document.getElementById('generator').scrollIntoView({behavior:'smooth'});
  });

  articleForm.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const topic = topicInput.value.trim();
    if(!topic) { alert('Please provide a topic or keywords.'); topicInput.focus(); return; }

    const audience = audienceInput.value.trim();
    const tone = toneSelect.value;
    const length = lengthSelect.value;

    generatedPre.textContent = '';
    loading.classList.remove('hidden');

    try{
      const resp = await fetch('/api/detect', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ topic, audience, tone, length })
      });

      if(!resp.ok){
        const text = await resp.text();
        throw new Error(text || 'Server error');
      }

      const data = await resp.json();
      const article = data.article || data.content || '';
      generatedPre.textContent = article;
    }catch(err){
      generatedPre.textContent = 'Error generating article. ' + (err.message || '');
    }finally{
      loading.classList.add('hidden');
    }
  });

  copyBtn.addEventListener('click', async ()=>{
    const text = generatedPre.textContent.trim();
    if(!text) return alert('No generated content to copy.');
    try{
      await navigator.clipboard.writeText(text);
      copyBtn.textContent = 'Copied!';
      setTimeout(()=> copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy', 1500);
    }catch(e){
      alert('Copy failed. You can select and copy manually.');
    }
  });

  regenerateBtn.addEventListener('click', ()=>{
    // re-submit with same values
    articleForm.requestSubmit();
  });

  shareBtn.addEventListener('click', async ()=>{
    const shareData = {
      title: 'GenZbot Article Generator',
      text: 'Check this AI article tool — generate articles from simple keywords in seconds! Try GenZbot.',
      url: window.location.href
    };
    if(navigator.share){
      try{ await navigator.share(shareData); }catch(e){ /* user canceled */ }
    }else{
      // fallback: copy text to clipboard
      try{
        await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
        alert('Link copied to clipboard. Share it with others!');
      }catch(e){
        alert('Sharing not supported. Please copy the URL manually.');
      }
    }
  });
});
