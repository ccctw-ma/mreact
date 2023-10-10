
let fiber = null;



fiber = {
    a: 1,
    next: null
}


let a = fiber;


fiber = fiber.next;


console.log(a.next);