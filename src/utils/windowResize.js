function windowResize() {
    window.onresize = () => {
        console.log('изменился размер экрана');
        
    }
}

export { windowResize }