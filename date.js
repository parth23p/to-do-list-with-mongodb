module.exports=getdate;

function getdate(){
    const today=new Date();


var options={
    weekday:"long",
    day:"numeric",
    month:"long"
};

var day=today.toLocaleDateString("en-US",options);
 
return day;
}