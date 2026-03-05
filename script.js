const form = document.getElementById('signupForm');
const submitBtn = document.getElementById('submitBtn');
const successMessage = document.getElementById('successMessage');

// Google Apps Script Deploy URL (維持原本的連結)
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzq-EArICEl50DYzwp_jx6wvdyrByIs3FltY3rkIrsnDS_BDEup25wKZ30vatDIp6uM/exec';

form.addEventListener('submit', function (e) {
    e.preventDefault(); // 防止預設送出

    // 1. 取得表單資料
    const formData = new FormData(form);

    // 2. 處理 Checkbox 多選資料
    // 取得所有被勾選的 input[name="session"] 元素
    const checkedSessions = form.querySelectorAll('input[name="session"]:checked');

    // 驗證：如果沒有勾選任何場次，阻止送出並提示
    if (checkedSessions.length === 0) {
        alert('請至少選擇一個您想參加的場次 (或選取「以上都會參加」)。');
        return; // 中斷函式，不往下執行
    }

    // 將所有勾選的 value 收集成陣列，再用逗號連接成字串
    // 例如: "2/25 (三)..., 4/09 (四)..."
    const sessionValues = Array.from(checkedSessions).map(cb => cb.value).join(', ');

    // 3. 準備要傳送的 payload
    const payload = {
        name: formData.get('name'),
        email: formData.get('email'),
        session: sessionValues, // 在這裡填入合併後的選字串
        recommender: formData.get('recommender'),
        expectation: formData.get('expectation'),
        note: formData.get('note')
    };

    // 4. 鎖定按鈕，顯示載入中
    submitBtn.disabled = true;
    submitBtn.textContent = '傳送中...';

    // 5. 發送資料到 Google Apps Script
    fetch(SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify(payload)
    })
        .then(response => {
            console.log('Success:', response);
            showSuccessView();
        })
        .catch(error => {
            console.error('Error:', error);
            alert('發生錯誤，請檢查網路連線或稍後再試。\n' + error);
            submitBtn.disabled = false;
            submitBtn.textContent = '送出報名';
        });
});

function showSuccessView() {
    // 隱藏表單
    const formSection = document.getElementById('signup');
    form.style.display = 'none';
    formSection.querySelector('.form-desc').style.display = 'none'; // 隱藏描述文字

    // 顯示成功訊息
    successMessage.style.display = 'block';

    // 捲動到成功訊息 (稍微上移一點)
    const yOffset = -100;
    const y = formSection.getBoundingClientRect().top + window.pageYOffset + yOffset;
    window.scrollTo({ top: y, behavior: 'smooth' });
}
