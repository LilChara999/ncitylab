Vue.component('countdown', {
  template: "#countdown-template",

 data() {
   return{
     deadline: 'Sep 1, 2020 00:00:00',
     days: '--', hours: '--', minutes: '--', seconds: '--',
     expired: false
   };
 },

 computed: {
   theTime(){
     var ctx = this;

     // Countdown loop
     var x =  setInterval(function(){

       // Difference between the 2 dates
       var countDownDate = new Date(ctx.deadline).getTime(),
           now = new Date().getTime(),
           diff = countDownDate - now,

           // Time conversion to days, hours, minutes and seconds
           tdays = Math.floor(diff / (1000 * 60 * 60 * 24)),
           thours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
           tminutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
           tseconds = Math.floor((diff % (1000 * 60)) / 1000);

       // Keep 2 digits
       ctx.days = (tdays < 10) ? '0' + tdays : tdays;
       ctx.hours = (thours < 10) ? '0' + thours : thours;
       ctx.minutes = (tminutes < 10) ? '0' + tminutes : tminutes;
       ctx.seconds = (tseconds < 10) ? '0' + tseconds : tseconds;

       // Check for time expiration
       if(diff < 0){
         clearInterval(x);
         ctx.expired = true;
       }
     }, 1000);

     // Return data
     return {
       days: ctx.days, hours: ctx.hours, minutes: ctx.minutes, seconds: ctx.seconds
     };
   }
 }
});



/**************************
  ROOT COMPONENT
 **************************/
var app = new Vue({
  el: '#app'
})
