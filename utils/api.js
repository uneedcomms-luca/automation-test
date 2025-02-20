const getShopInfo = async (idx) => {
  const res = await fetch(`https://api.keepgrow.com/shop/${idx}`);
  return await res.json();
};

const Api = { getShopInfo };

module.exports = Api;
