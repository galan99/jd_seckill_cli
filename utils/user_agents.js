const user_agents = require("./user_agents_list");

class UserAgents {
    
    static randomUserAgentInArr(arr) {
        return arr.length === 0
            ? null
            : arr[Math.floor(arr.length * Math.random())];
    }

    static random() {
        return this.randomUserAgentInArr(user_agents) + "Trident";
    }

    static filterByRegex(reg) {
        return user_agents.filter((item) => item.match(reg));
    }

    static randomByRegex(reg) {
        return this.randomUserAgentInArr(this.filterByRegex(reg));
    }
}
module.exports = UserAgents;
