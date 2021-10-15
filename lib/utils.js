module.exports = {
  getFilterDaysAgo: (days = 30) => {
    let today = new Date();
    let pastDateTemp = new Date().setDate(today.getDate() - days);
    let pastDate = new Date(pastDateTemp);

    return `${pastDate.toISOString()}..${today.toISOString()}`;
  },
};
