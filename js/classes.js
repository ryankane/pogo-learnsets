const movePattern = /^V(\d{4})_MOVE_\w+$/;
const pokemonPattern = /^V(\d{4})_POKEMON_\w+$/;
const genderPattern = /^SPAWN_V(\d{4})_POKEMON_\w+$/;

class Model {
  constructor() {
    if (new.target === Model) {
      throw new TypeError("Cannot construct Model instances directly");
    }

    this.id = null;
    this.name = null;
    this.index = 0;
  }
}

class Move extends Model {
  constructor() {
    super();
    
    this.type = null;
    this.power = 0;
    this.duration = 0;
    this.energy = 0;
  }
  
  calculateCooldown() {
    return this.duration / 1000.0;
  }

  calculateDamagePerSecond() {
    return this.power / this.calculateCooldown();
  }

  calculateEnergyPerSecond() {
    return this.energy / this.calculateCooldown();
  }

  isFast() {
    return this.name.includes('_FAST');
  }

  static parse(data) {
    var m = new Move();
    var tokens = data.templateId.match(movePattern);
    
    m.id = data.templateId;
    m.name = data.moveSettings.movementId;
    m.index = parseInt(tokens[1], 10);

    m.type = data.moveSettings.pokemonType;
    m.power = data.moveSettings.power;
    m.duration = data.moveSettings.durationMs;
    m.energy = data.moveSettings.energyDelta;
    
    return m;
  }
}

class Pokemon extends Model {
  constructor() {
    super();

    this.type1 = null;
    this.type2 = null;
    this.height = 0;
    this.weight = 0;
    this.stamina = 0;
    this.attack = 0;
    this.defense = 0;
    this.captureRate = 0;
    this.fleeRate = 0;
    this.fastAttacks = [];
    this.chargedAttacks = [];
    this.buddyDistance = 0;
    this.buddySize = null;
    this.evolvesFrom = null;
    this.family = null;
    this.evolution = null;
    this.candyCost = 0;
  }
  
  static parse(data) {
    var p = new Pokemon();
    var tokens = data.templateId.match(pokemonPattern);

    p.id = data.templateId;
    p.name = data.pokemonSettings.pokemonId;
    p.index = parseInt(tokens[1], 10);

    p.type1 = data.pokemonSettings.type;
    p.type2 = data.pokemonSettings.type2;
    p.height = data.pokemonSettings.pokedexHeightM;
    p.weight = data.pokemonSettings.pokedexWeightKg;
    p.stamina = data.pokemonSettings.stats.baseStamina;
    p.attack = data.pokemonSettings.stats.baseAttack;
    p.defense = data.pokemonSettings.stats.baseDefense;
    p.captureRate = data.pokemonSettings.encounter.baseCaptureRate;
    p.fleeRate = data.pokemonSettings.encounter.baseFleeRate;
    p.fastAttacks = data.pokemonSettings.quickMoves;
    p.chargedAttacks = data.pokemonSettings.cinematicMoves;
    p.buddyDistance = data.pokemonSettings.kmBuddyDistance;
    p.buddySize = data.pokemonSettings.buddySize;
    p.evolvesFrom = data.pokemonSettings.parentPokemonId;
    p.family = data.pokemonSettings.familyId;

    if (data.pokemonSettings.evolutionBranch && data.pokemonSettings.evolutionBranch.length > 0) {
      p.evolution = data.pokemonSettings.evolutionBranch[0].evolution;
      p.candyCost = data.pokemonSettings.evolutionBranch[0].candyCost;
    }

    return p;
  }
}

class Gender extends Model {
  constructor() {
    super();

    this.malePercent = 0;
    this.femalePercent = 0;
    this.genderlessPercent = 0;
  }
  
  static parse(data) {
    var p = new Gender();
    var tokens = data.templateId.match(genderPattern);

    p.id = data.templateId;
    p.name = data.genderSettings.name;
    p.index = parseInt(tokens[1], 10);

    if (data.genderSettings.gender.malePercent) {
      p.malePercent = data.genderSettings.gender.malePercent;
    }
    if (data.genderSettings.gender.femalePercent) {
      p.femalePercent = data.genderSettings.gender.femalePercent;
    }
    if (data.genderSettings.gender.genderlessPercent) {
      p.genderlessPercent = data.genderSettings.gender.genderlessPercent;
    }

    return p;
  }
}

class MoveStore extends JsonStore {
  constructor() {
    super({
      url : "assets/data/GAME_MASTER.json",
      rootProperty : 'itemTemplates',
      model : Move,
      autoLoad : true,
      sorters : [ 'name' ],
      filterFn : (record) => movePattern.test(record.templateId)
    });
  }
}

class GenderStore extends JsonStore {
  constructor() {
    super({
      url : "assets/data/GAME_MASTER.json",
      rootProperty : 'itemTemplates',
      model : Gender,
      autoLoad : true,
      filterFn : (record) => genderPattern.test(record.templateId)
    });
  }
}

class PokemonStore extends JsonStore {
  constructor() {
    super({
      url : "assets/data/GAME_MASTER.json",
      rootProperty : 'itemTemplates',
      model : Pokemon,
      autoLoad : true,
      filterFn : (record) => pokemonPattern.test(record.templateId)
    });
  }
}

class MoveDictionary extends Dictionary {
  constructor(language) {
    super({
      resource : "assets/language/moves.txt",
      language : language
    });
  }
}

class PokemonDictionary extends Dictionary {
  constructor(language) {
    super({
      resource : "assets/language/pokemon.txt",
      language : language
    });
  }
}

class GeneralDictionary extends Dictionary {
  constructor(language) {
    super({
      resource : "assets/language/general.txt",
      language : language
    });
  }
}
