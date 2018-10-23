 export class Styles {


    //Method to fix dropdownListSize after load
    public static fixDropDownHeigh(cssClass, padding){
    setTimeout(() => {
        $("." + cssClass + " ul li").css("min-height", padding + "px");
        $("." + cssClass + " ul li span").css("padding-top", padding + "px");
        $("." + cssClass + " ul li span").css("padding-bottom", padding + "px");
      }, 1000);
    }
    
}