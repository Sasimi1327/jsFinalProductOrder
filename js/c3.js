// C3.js
function renderC3(data) {
  // console.log("C3");
  let newData;

  if (data.length === 0) {
    newData = [];
  } else {
    //加總統計{品項名稱: 總計(數量*售價)}
    let totalObj = data.reduce((accOut, curOut) => {
      //訂單統計 {品項名稱: 總計(數量*售價)}
      let obj = curOut.products.reduce((acc, cur) => {
        acc[cur.title] = (acc[cur.title] || 0) + cur.quantity * cur.price;
        return acc;
      }, {});
      Object.keys(obj).forEach((item) => {
        accOut[item] = (accOut[item] || 0) + obj[item];
      });
      return accOut;
    }, {});

    //物件轉陣列後再排序
    newData = Object.entries(totalObj).sort(function (a, b) {
      return b[1] - a[1];
    });
    // console.log(newData);

    //大於4種品項，才需要切出其他的類別
    if (newData.length > 3) {
      const othersTotal = newData
        .splice(3)
        .reduce((acc, cur) => (acc += cur[1]), 0);
      newData.push(["其他", othersTotal]);
    }

    // console.log(newData);
  }

  //套件渲染圖形
  let chart = c3.generate({
    bindto: "#chart", // HTML 元素綁定
    data: {
      type: "pie",
      columns: newData,
      // colors: {
      //   [newData[0][0]]: "#DACBFF",
      //   [newData[0][1]]: "#9D7FEA",
      //   [newData[0][2]]: "#5434A7",
      //   其他: "#301E5F",
      // },
    },
  });
}
