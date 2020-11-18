document.addEventListener('DOMContentLoaded', function() {
  var modalButtons = document.querySelectorAll('.js-open-modal'),
  overlay = document.querySelector('#overlay-modal'),
  closeButtons = document.querySelectorAll('.js-modal-close');

  modalButtons.forEach(function(item){
    item.addEventListener('click', function(event) {
      event.preventDefault();
      var modalId = this.getAttribute('data-modal'),
      modalElem = document.querySelector('.modal[data-modal="' + modalId + '"]');
      modalElem.classList.add('active');
      overlay.classList.add('active');
    });
    closeButtons.forEach(function(item){
      item.addEventListener('click', function(e) {
        parentModal.classList.remove('active');
        overlay.classList.remove('active');
      });
    });
  });
});
