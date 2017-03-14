module.exports = class Item {
	constructor(name, description, weight, durability, pickup){
		this.namePrint = name;
		this.name = name.toLowerCase();
		this.description = description;
		this.weight = weight;
		this.durability = durability;
		this.pickup = pickup;
	};	
};