<template>
    <div class="login-container">
      <div class="logo">
        <span><img src="@/assets/icon/PIOMS_로고.png" alt="PIOMS Logo"></span>
      </div>
      <div class="login-form">
        <h2>관리자 로그인</h2>
        <div class="input-group">
          <i class="fas fa-user"></i>
          <input type="text" v-model="username" placeholder="아이디" @keydown.enter="login" />
        </div>
        <div class="input-group">
          <i class="fas fa-key"></i>
          <input type="password" v-model="password" placeholder="비밀번호" @keydown.enter="login" />
        </div>
        <div class="input-group">
          <i class="fas fa-lock"></i>
          <input type="password" v-model="accessNumber" placeholder="Access Number" @keydown.enter="login" />
        </div>
        <button class="login-button" @click="login">로그인</button>
      </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import Swal from 'sweetalert2';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { jwtDecode } from 'jwt-decode';

const username = ref('');
const password = ref('');
const accessNumber = ref('');

const router = useRouter();
const store = useStore();

const login = async () => {
  try {
    console.log('로그인 시도:', { username: username.value, password: password.value, accessNumber: accessNumber.value });

    const response = await fetch('http://api.pioms.shop/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        adminId: username.value,
        password: password.value,
        accessNumber: accessNumber.value
      }),
      credentials: 'include'
    });

    if (response.ok) {
      console.log('로그인 성공, 응답 헤더:', response.headers);

      const accessToken = response.headers.get('Authorization')?.substring(7).trim();
      console.log('추출한 accessToken:', accessToken);

      if (accessToken) {
        await store.dispatch('login', { accessToken });

        const decodedToken = jwtDecode(accessToken);
        const usernameFromToken = decodedToken.username;

        Swal.fire({
          icon: 'success',
          title: `${usernameFromToken}님 환영합니다`,
          showConfirmButton: false,
          timer: 2000
        });

        await router.push('/admin/home');
      } else {
        throw new Error('Access token not found');
      }
    } else {
      Swal.fire({
        icon: 'error',
        title: '로그인 실패',
        text: '자격 증명을 확인하세요.',
      });
    }
  } catch (error) {
    console.error('로그인 오류:', error);
    Swal.fire({
      icon: 'error',
      title: '오류 발생',
      text: '오류가 발생했습니다. 다시 시도하세요.',
    });
  }
};
</script>


<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');


.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.logo {
  display: flex;
  font-size: 2rem;
  margin-bottom: 20px;
}

.logo span {
  display: inline-block;
  margin: 0 5px;
}

.logo .icon {
  font-size: 2rem;
  margin: 0 5px;
}

.login-form {
  scale: 120%;
  background: white;
  padding: 40px;
  border-radius: 10px;
  box-shadow: 18px 20px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
  width: 300px;
}

.login-form h2 {
  margin-bottom: 20px;
  color: #333;
}

.input-group {
  display: flex;
  align-items: center;
  background: #f0f0f0;
  border-radius: 5px;
  padding: 10px;
  margin-bottom: 15px;
}

.input-group i {
  margin-right: 10px;
  color: #888;
}

.input-group input {
  border: none;
  background: none;
  outline: none;
  flex: 1;
  padding: 5px;
}

.login-button {
  --width: 150px;
  --timing: 2s;
  border: 0;
  width: var(--width);
  padding-block: 1em;
  color: #fff;
  font-weight: bold;
  font-size: 1em;
  background: rgb(185,185,185);
  transition: all 0.2s;
  border-radius: 3px;
  cursor: pointer;
}

.login-button:hover {
  background-image: linear-gradient(
      to right,
      rgb(252,111,134),
      rgb(252,111,134) 16.65%,
      rgb(255,205,75) 16.65%,
      rgb(255,205,75) 33.3%,
      rgb(57,76,169) 33.3%,
      rgb(57,76,169) 49.95%,
      rgb(252,111,134) 49.95%,
      rgb(252,111,134) 66.6%,
      rgb(255,205,75) 66.6%,
      rgb(255,205,75) 83.25%,
      rgb(57,76,169) 83.25%,
      rgb(57,76,169) 100%,
      rgb(185,185,185) 100%
  );
  animation: var(--timing) linear dance6123 infinite;
  transform: scale(1.1) translateY(-1px);
}

@keyframes dance6123 {
  to {
    background-position: var(--width);
  }
}

.error {
  color: red;
  margin-top: 10px;
}
</style>
