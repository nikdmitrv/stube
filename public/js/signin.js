document.addEventListener('click', async e => {
    if (e.target.type === 'submit') {
        e.preventDefault();
        const request = await fetch('/user/signin', {
            method: 'post',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify({
                username: document.auth.username.value,
                password: document.auth.password.value,
            })
        })
        const response = await request.json();
        if (await response.data.error) {
            const h = document.createElement('h3');
            h.innerText = response.data.message;
            document.getElementById('error-message')
                .appendChild(h);
        } else {
            window.location.replace('https://localhost:3000/')
        }
    }
})
