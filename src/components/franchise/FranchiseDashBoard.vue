<template>
  <div class="dashboard-container">
    <div class="sidebar">
      <div class="sidebar-content">Dash board</div>
    </div>
    <div class="main-content">
      <div class="top-row">
        <div class="section order-status">
          <h2>내 발주 현황</h2>
          <div class="status-boxes">
            <div class="status-box">
              <div class="status-count">2</div>
              <div class="status-label">승인 대기</div>
            </div>
            <div class="status-box">
              <div class="status-count">1</div>
              <div class="status-label">승인 완료</div>
            </div>
            <div class="status-box">
              <div class="status-count">-</div>
              <div class="status-label">승인 반려</div>
            </div>
          </div>
        </div>
        <div class="section inventory-alert">
          <h2>재고 알림</h2>
          <div class="inventory-info" v-if="lowStockItems.length">
            <div v-for="item in lowStockItems" :key="item.franchiseWarehouseCode">
              <div>상품명: {{ item.product.productName }}</div>
              <div>재고: {{ item.franchiseWarehouseEnable }}</div>
            </div>
          </div>
          <div v-else>
            <div>재고가 부족한 상품이 없습니다.</div>
          </div>
        </div>
      </div>
      <div class="bottom-row">
        <div class="section notice-list">
          <router-link to="/admin/notice/list" class="notice-link">공지사항 리스트</router-link>
          <ul class="list">
            <li v-for="item in paginatedNotices" :key="item.noticeCode" class="list-item">
              <div class="notice-title">{{ item.noticeTitle }}</div>
              <div>{{ formatNoticeDate(item.noticeEnrollDate) }}</div>
            </li>
          </ul>
          <div class="pagination">
            <button @click="prevNoticePage" :disabled="noticeCurrentPage === 1">이전</button>
            <button @click="nextNoticePage" :disabled="noticeCurrentPage === noticeTotalPages">다음</button>
          </div>
        </div>
        <div class="section inquiry-list">
          <router-link to="/franchise/ask" class="inquiry-link">문의사항 리스트</router-link>
          <ul class="list">
            <li v-for="item in paginatedAsks" :key="item.askCode" class="list-item">
              <div class="title">{{ item.askTitle }}</div>
              <div class="status-container">
                <div class="status"
                     :class="{ 'status-pending': item.askStatus === '답변대기', 'status-complete': item.askStatus === '답변완료' }">
                  {{ item.askStatus }}
                </div>
                <div class="date">{{ formatAskDate(item.askEnrollDate) }}</div>
              </div>
            </li>
          </ul>
          <div class="pagination">
            <button @click="prevPage" :disabled="currentPage === 1">이전</button>
            <button @click="nextPage" :disabled="currentPage === totalPages">다음</button>
          </div>
        </div>
        <div class="section favorite-products">
          <router-link to="/franchise/favorite/list" class="favorite-link">즐겨찾기 상품 목록</router-link>
          <ul class="list">
            <li v-for="item in paginatedFavorites" :key="item.franchiseWarehouseCode" class="list-item">
              <div>
                {{ item.product.productName }}
                <span class="category">
                  {{ item.product.categoryThird.categorySecond.categorySecondName }} >
                  {{ item.product.categoryThird.categoryThirdName }}
                </span>
              </div>
              <div>{{ item.product.productStatus }}</div>
            </li>
          </ul>
          <div class="pagination">
            <button @click="prevFavoritesPage" :disabled="favoritesCurrentPage === 1">이전</button>
            <button @click="nextFavoritesPage" :disabled="favoritesCurrentPage === favoritesTotalPages">다음</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';

const store = useStore();
const accessToken = store.state.accessToken;

const notices = ref([]);
const asks = ref([]);
const filteredAsks = ref([]);
const favorites = ref([]);
const lowStockItems = ref([]);

const currentPage = ref(1);
const noticeCurrentPage = ref(1);
const favoritesCurrentPage = ref(1);
const itemsPerPage = 6;

const fetchAsks = async () => {
  try {
    const response = await fetch(`http://localhost:5000/franchise/ask/list`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    asks.value = data.asks || data.askDTOs || [];
    filteredAsks.value = asks.value;
  } catch (error) {
    console.error('Failed to fetch asks:', error);
  }
};

const fetchNotices = async () => {
  try {
    const response = await fetch(`http://localhost:5000/franchise/notice/list`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    notices.value = data;
  } catch (error) {
    console.error('Failed to fetch notices:', error);
  }
};

const fetchProducts = async () => {
  try {
    const response = await fetch(`http://localhost:5000/franchise/warehouse/list/product`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    lowStockItems.value = data.filter(item => item.franchiseWarehouseEnable < 10 && item.franchiseCode === 3);
  } catch (error) {
    console.error('Failed to fetch products:', error);
  }
};


const fetchFavorites = async () => {
  try {
    const response = await fetch(`http://localhost:5000/franchise/warehouse/favorites`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    favorites.value = data;
  } catch (error) {
    console.error('Failed to fetch favorites:', error);
  }
};

const paginatedAsks = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredAsks.value.slice(start, end);
});

const paginatedNotices = computed(() => {
  const start = (noticeCurrentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return notices.value.slice(start, end);
});

const paginatedFavorites = computed(() => {
  const start = (favoritesCurrentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return favorites.value.slice(start, end);
});

const totalPages = computed(() => {
  return Math.ceil(filteredAsks.value.length / itemsPerPage);
});

const noticeTotalPages = computed(() => {
  return Math.ceil(notices.value.length / itemsPerPage);
});

const favoritesTotalPages = computed(() => {
  return Math.ceil(favorites.value.length / itemsPerPage);
});

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

const prevNoticePage = () => {
  if (noticeCurrentPage.value > 1) {
    noticeCurrentPage.value--;
  }
};

const nextNoticePage = () => {
  if (noticeCurrentPage.value < noticeTotalPages.value) {
    noticeCurrentPage.value++;
  }
};

const prevFavoritesPage = () => {
  if (favoritesCurrentPage.value > 1) {
    favoritesCurrentPage.value--;
  }
};

const nextFavoritesPage = () => {
  if (favoritesCurrentPage.value < favoritesTotalPages.value) {
    favoritesCurrentPage.value++;
  }
};

const formatAskDate = (dateArray) => {
  if (!dateArray) return '-';
  const [year, month, day, hour, minute, second] = dateArray;
  const date = new Date(year, month - 1, day, hour, minute, second);
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
};

const formatNoticeDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

onMounted(() => {
  fetchAsks();
  fetchNotices();
  fetchFavorites();
  fetchProducts(); // Fetch products for inventory alert
});
</script>

<style scoped>
.dashboard-container {
  display: flex;
}

.sidebar {
  width: 200px;
  background-color: #f4f4f4;
  border-right: 1px solid #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
}

.main-content {
  display: flex;
  flex: 1;
  flex-direction: column;
  padding: 20px;
}

.top-row {
  display: flex;
  gap: 20px;
  padding-bottom: 30px;
  height: 60%;
}

.bottom-row {
  display: flex;
  gap: 27px;
}

.section {
  background-color: #fff;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid #ddd;
  flex: 1;
}

.notice-list,
.inquiry-list {
  flex: 1;
  max-width: 20%; /* 가로 길이 조정 */
}

.status-boxes {
  display: flex;
  justify-content: space-around;
}

.status-box {
  text-align: center;
}

.status-count {
  font-size: 24px;
  font-weight: bold;
}

.status-label {
  margin-top: 10px;
}

.list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.list-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px; /* 간격 추가 */
  border-bottom: 1px solid #ddd; /* 하단 선 추가 */
  padding-bottom: 10px; /* 간격 추가 */
  overflow: hidden; /* 텍스트 오버플로우 숨기기 */
  text-overflow: ellipsis; /* 텍스트가 길 경우 생략 표시 */
}

.notice-list .list-item {
  margin-bottom: 30px; /* 공지사항의 타이틀 간 간격 조정 */
}

.notice-title {
  font-size: 16px; /* 공지사항 제목 폰트 크기 */
  color: #333;
  font-weight: bold;
}

.notice-link,
.inquiry-link,
.favorite-link {
  display: block;
  font-size: 18px; /* 폰트 크기 키우기 */
  font-weight: bold; /* 폰트 굵게 */
  color: #333;
  text-decoration: none;
  margin-bottom: 10px;
}

.order-status {
  flex: 1;
  height: 80%;
}

.inventory-alert {
  flex: 1;
  height: 80%;
}

.favorite-products {
  flex: 1;
}

.notice-link:hover,
.inquiry-link:hover,
.favorite-link:hover {
  color: #000;
}

.title {
  flex: 1;
  margin-right: 10px; /* 상태와의 간격 추가 */
}

.status-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.status {
  background-color: #f8d7da;
  color: #721c24;
  padding: 3px 10px;
  border-radius: 5px;
  font-size: 12px; /* 폰트 크기 줄이기 */
  margin-bottom: 5px;
}

.status-pending {
  background-color: #ff6285;
}

.status-complete {
  background-color: #FFCD4B;
}

.date {
  font-size: 12px; /* 날짜 폰트 크기 줄이기 */
  color: #666;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}

.pagination button {
  background-color: #fff;
  color: black;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  padding: 8px 16px;
  font-size: 14px;
  margin: 0 5px;
}

.pagination button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.category {
  font-size: 12px; /* 카테고리 폰트 크기 */
  color: #666; /* 카테고리 색상 */
  margin-left: 5px;
}
</style>