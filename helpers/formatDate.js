module.exports = (dateLocal) => {
    let date = new Date(dateLocal);

    // Định dạng chỉ hiển thị ngày tháng năm, giờ phút giây
    let formattedDate = new Intl.DateTimeFormat('vi-VN', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
    }).format(date);
    return formattedDate
}

