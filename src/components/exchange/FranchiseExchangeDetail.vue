<template>
  <div class="popup-overlay">
    <div class="popup-content">
      <br>
      <div class="info">
        <h1 align="center">반품 및 교환 주문서</h1>

        <div style="display:flex;" align="center">
          <div class="divvv2">
            <div class="divvv3-title">
              가맹점명
            </div>
            <div class="divvv3">
              {{ item.franchiseName }}
            </div>
          </div>
          <div class="divvv2">
            <div class="divvv3-title">
              점주명
            </div>
            <div class="divvv3">
              {{ item.franchiseOwnerName }}
            </div>
          </div>
          <div class="divvv2">
            <div class="divvv3-title">
              반품번호
            </div>
            <div class="divvv3">
              {{ item.exchangeCode }}
            </div>
          </div>
        </div>

        <div class="divvv-title">
          반품 및 교환 항목
        </div>
        <div class="table-container">
          <table class="table">
            <thead>
              <tr class="header1">
                <th>상품 코드</th>
                <th>상품 이름</th>
                <th>반품 수량</th>
                <th>반품/폐기</th>
              </tr>
            </thead>
            <!-- 처리 대기중인 교환인 경우 -->
            <tr class="allpost" v-for="(product, index) in list" :key="index" align="center">
              <td>{{ product.productCode }}</td>
              <td>{{ product.productName }}</td>
              <td>{{ product.exchangeProductCount }}</td>
              <td>{{ product.exchangeProductStatus }}</td>
            </tr>
          </table>
        </div>
        <br><br><br><br>

        <br>
      </div>
      신청일자 : {{ item.exchangeDate }}
        <div class="action-buttons" >
          <input class="ho-btn" v-if="item.exchangeStatus=='반송신청'" type="button" value="삭제하기" @click="deleteExchange">
          <input class="ho-btn" type="button" value="돌아가기" @click="showDetailPopup">
        </div>
      <br>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import axios from 'axios';
import FranchiseExchangePage from "./FranchiseExchangePage.vue";
import Swal from "sweetalert2"; // Vuex store 임포트

import { useStore } from 'vuex'; // Vuex store 임포트
const store = useStore(); // Vuex store 사용

const headers = ref([
  { key: 'productName', label: '상품명' },
  { key: 'exchangeProductStatus', label: '반품/폐기' },
  { key: 'exchangeProductCount', label: '요청 수량' },
  { key: 'exchangeNormalCount', label: '정상 수량' },
  { key: 'exchangeDiscount', label: '폐기 수량' },
]);

const props = defineProps({
  showDetailPopup: Function,
  popupVisible: Boolean,
  writeActive: Boolean,
  detailItem: Object,
});
const item = props.detailItem;
const list = props.detailItem.products;
console.log(list);

// 추후 개선 예정
const franchiseOwnerCode = ref(1);


const deleteExchange = async () => {
  try {
    const accessToken = store.state.accessToken;
    if (!accessToken) {
      throw new Error('No access token found');
    }
    const response = await fetch(`http://api.pioms.shop/franchise/exchange/${item.exchangeCode}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      });
    if (response.status == 406) {
      alert("삭제 불가..");
      return;
    }
    if (!response.ok) {
      alert("서버 에러 발생 ");
      throw new Error('네트워크 오류 발생');
    }
    await Swal.fire({
        position: "center",
        icon: "success",
        title: "삭제되었습니다.",
        showConfirmButton: false,
        timer: 1500
      });
    location.reload(FranchiseExchangePage);
    props.showDetailPopup();
  } catch (error) {
    await Swal.fire({
        position: "center",
        icon: "error",
        title: "잘못된 요청입니다.",
        showConfirmButton: false,
        timer: 1500
      });
      location.reload(FranchiseExchangePage);
    props.showDetailPopup();
    console.error('오류 발생:', error);
  }
};


</script>


<style scoped>
  @import "../../assets/css/order.css" ;
  @import "../../assets/css/popup.css" ;

</style>
