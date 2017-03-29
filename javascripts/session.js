//okay, fine, yes, global variables are getting untenable.
function Session(session_id){
	this.session_id = session_id; //initial seed
	this.players = [];
	this.hasClubs = false;
	this.hasDiamonds = false;
	this.hasHearts = false;
	this.hasSpades = false;
	this.guardians = [];
	this.kingStrength = 100;
	this.queenStrength = 100;
	this.jackStrength = 50;
	this.hardStrength = 275;
	this.minFrogLevel = 18;
	this.goodFrogLevel = 28;
	this.democracyStrength = 0;
	this.reckoningStarted = false;
	this.murdersHappened = false;
	this.ectoBiologyStarted = false;
	this.doomedTimeline = false;
	this.makeCombinedSession = false; //happens if sick frog and few living players
	this.scratched = false;
	this.scratchAvailable = false;
	this.timeTillReckoning = 0;
	this.sessionType = -999
	this.scenesTriggered = []; //this.scenesTriggered
	this.doomedTimelineReasons = [];
	this.currentSceneNum = 0;
	this.scenes = []; //scene controller initializes all this.
	this.reckoningScenes = [];
	this.deathScenes = [];
	this.available_scenes = [];
	this.hadCombinedSession = false;
	this.parentSession = null;
	this.availablePlayers = [];  //which players are available for scenes or whatever.
	this.importantEvents = [];
	this.yellowYardController = new YellowYardResultController();//don't expect doomed time clones to follow them to any new sessions

	//IMPORTANT do not add important events directly, or can't check for alternate timelines.
	//oh god, just typing that gives me chills. time shenanigans are so great.
	this.addImportantEvent = function(important_event){
		var alternate = this.yellowYardController.doesEventNeedToBeUndone(important_event);
		if(alternate){
			return alternate; //scene will use the alternate to go a different way. important event no longer happens.
		}else{

			this.importantEvents.push(important_event);
			return null;
		}
	}

	//make Math.seed  = to my session id, reinit all my variables (similar to a scratch.)
	//make sure the controller starts ticking again. very similar to scrach
	this.addEventToUndoAndReset = function(e){
		console.log("todo: implement altenate events. be careful if event added in for loop (don't return). also, have jrab convo change if there are events stored in the yellowyard controller. that means this happened multiple times ");
		this.yellowYardController.eventsToUndo.push(e);
		//reinit the seed and restart the session

		this.reinit();
		createScenesForSession(curSessionGlobalVar);
		//players need to be reinit as well.
		curSessionGlobalVar.makePlayers();
		curSessionGlobalVar.randomizeEntryOrder();
		//authorMessage();
		curSessionGlobalVar.makeGuardians(); //after entry order established
		restartSession();//in controller
		//killing a player events are different. need to figure out how
	}


	//child sessions are basically any session with an ID that matches the seed you stop on
	//TODO could possibly be constrained to need a space or time player to navigage. or godtier light/doom??? could further require the player be from derse
	//but this already 2-4% of all sessions, do i really want it to  be even rarer?
	this.initializeCombinedSession = function(){
		var living = findLivingPlayers(this.players);
		//nobody is the leader anymore.
		var newSession = new Session(Math.seed);  //this is a real session that could have gone on without these new players.
		newSession.currentSceneNum = this.currentSceneNum;
		newSession.reinit();
		newSession.makePlayers();
		newSession.randomizeEntryOrder();
		newSession.makeGuardians();
		if(living.length + newSession.players.length > 12){
			//console.log("New session " + newSession.session_id +" cannot support living players. Already has " + newSession.players.length + " and would need to add: " + living.length)
			return;  //their child session is not able to support them
		}
		//console.log("TODO add a method for a session to simulate itself. if this session EVER can support the new players, insert them there");
		for(var i = 0; i<living.length; i++){
			var survivor = living[i];
			survivor.land = null;
			survivor.dreamSelf = false;
			survivor.godDestiny = false;
			survivor.leader = false;
			survivor.generateRelationships(newSession.players); //don't need to regenerate relationship with your old friends
		}
		for(var j= 0; j<newSession.players.length; j++){
			var player = newSession.players[j];
			player.generateRelationships(living);
		}

		for(var i = 0; i<living.length; i++){
			for(var j= 0; j<newSession.players.length; j++){
					var player = newSession.players[j];
					var survivor = living[i];
					//survivors have been talking to players for a very long time, because time has no meaning between univereses.
					var r1 = survivor.getRelationshipWith(player);
					var r2 = player.getRelationshipWith(survivor);
					r1.moreOfSame();
					r1.moreOfSame();
					//been longer from player perspective
					r2.moreOfSame();
					r2.moreOfSame();
					r2.moreOfSame();
					r2.moreOfSame();
			}
		}

		newSession.players= newSession.players.concat(living);
		this.hadCombinedSession = true;
		newSession.parentSession = this;
		createScenesForSession(newSession);
		console.log("Session: " + this.session_id + " has made child universe: " + newSession.session_id + " child has this long till reckoning: " + newSession.timeTillReckoning)
		return newSession;
	}

	this.getVersionOfPlayerFromThisSession = function(player){
		//can double up on classes or aspects if it's a combo session. god. why are their combo sessions?
		for(var i = 0; i< this.players.length; i++){
			var p = this.players[i];
			if(p.class_name == player.class_name && p.aspect == player.aspect){
				return p; //yeah, technically there COULD be two players with the same claspect in a combo session, but i have ceased caring.
			}
		}
		console.log("Error finding session's: " + player.title());
	}


	//if htis is used for scratch, manually save ectobiology cause it's getting reset here
	this.reinit = function(){
		groundHog = false;
		Math.seed = this.session_id; //if session is reset,
		//console.log("reinit with seed: "  + Math.seed)
		this.timeTillReckoning = getRandomInt(10,30);
		this.sessionType = Math.seededRandom();
		curSessionGlobalVar.available_scenes = curSessionGlobalVar.scenes.slice(0);
		curSessionGlobalVar.doomedTimeline = false;
		this.kingStrength = 100;
		this.queenStrength = 100;
		this.jackStrength = 50;
		this.democracyStrength = 0;
		this.reckoningStarted = false;
		this.importantEvents = [];
		this.scenesTriggered = []; //this.scenesTriggered
		this.doomedTimelineReasons = [];
		this.ectoBiologyStarted = false;

	}

	this.makePlayers = function(){
		//console.log("Making players with seed: " + Math.seed)
		this.players = [];
		available_classes = classes.slice(0); //re-initPlayers available classes.
		available_aspects = nonrequired_aspects.slice(0);
		var numPlayers = getRandomInt(2,12);
		this.players.push(randomSpacePlayer(this));
		this.players.push(randomTimePlayer(this));

		for(var i = 2; i<numPlayers; i++){
			this.players.push(randomPlayer(this));
		}

		for(var j = 0; j<this.players.length; j++){
			var p = this.players[j];

			p.generateRelationships(this.players);
			this.decideTroll(p);

			if(p.isTroll){
				p.quirk = randomTrollSim(p)
			}else{
				p.quirk = randomHumanSim(p);
			}
		}

		for(var k = 0; k<this.players.length; k++){
			//can't escape consequences.
			this.players[k].consequencesForGoodPlayer();
			this.players[k].consequencesForTerriblePlayer();
		}
	}

	this.convertPlayerNumberToWords = function(){
		//alien players don't count
		var ps = findPlayersFromSessionWithId(this.players, this.session_id);
		if(ps.length == 0){
			ps = this.players;
		}
		var length = ps.length;
		if(length == 2){
			return "TWO";
		}else if(length == 3){
			return "THREE";
		}else if(length == 4){
			return "FOUR";
		}else if(length == 5){
			return "FIVE";
		}else if(length == 6){
			return "SIX";
		}else if(length == 7){
			return "SEVEN";
		}else if(length == 8){
			return "EIGHT";
		}else if(length == 9){
			return "NINE";
		}else if(length == 10){
			return "TEN";
		}else if(length == 11){
			return "ELEVEN";
		}else if(length == 12){
			return "TWELVE";
		}
	}

	this.makeGuardians = function(){
		this.guardians = [];
		//console.log("Making guardians")
		available_classes = classes.slice(0);
		available_aspects = nonrequired_aspects.slice(0); //required_aspects
		available_aspects = available_aspects.concat(required_aspects.slice(0));
		for(var i = 0; i<this.players.length; i++){
			  var player = this.players[i];
				//console.log("guardian for " + player.titleBasic());
				var guardian = randomPlayer(this);
				guardian.isTroll = player.isTroll;
				if(guardian.isTroll){
					guardian.quirk = randomTrollSim(guardian)
				}else{
					guardian.quirk = randomHumanSim(guardian);
				}
				guardian.quirk.favoriteNumber = player.quirk.favoriteNumber;
				guardian.bloodColor = player.bloodColor;
				guardian.lusus = player.lusus;
				if(guardian.isTroll == true){ //trolls always use lusus.
					guardian.kernel_sprite = player.kernel_sprite;
				}
				guardian.hairColor = player.hairColor;
				guardian.aspect = player.aspect;
				guardian.leftHorn = player.leftHorn;
				guardian.rightHorn = player.rightHorn;
				guardian.level_index = 5; //scratched kids start more leveled up
				guardian.power = 50;
				guardian.leader = player.leader;
				if(Math.seededRandom() >0.5){ //have SOMETHING in common with your ectorelative.
					guardian.interest1 = player.interest1;
				}else{
					guardian.interest2 = player.interest2;
				}
				guardian.reinit();//redo levels and land based on real aspect
				this.guardians.push(guardian);
		}

		for(var j = 0; j<this.guardians.length; j++){
			var g = this.guardians[j];
			g.generateRelationships(this.guardians);
		}

		for(var k = 0; k<this.guardians.length; k++){
			//can't escape consequences.
			this.guardians[k].consequencesForGoodPlayer();
			this.guardians[k].consequencesForTerriblePlayer();
		}
	}

	this.randomizeEntryOrder = function(){
		this.players = shuffle(this.players);
		this.players[0].leader = true;
	}

	this.decideTroll = function decideTroll(player){
		if(this.getSessionType() == "Human"){
			return;
		}

		if(this.getSessionType() == "Troll" || (this.getSessionType() == "Mixed" &&Math.seededRandom() > 0.5) ){
			player.isTroll = true;
			player.triggerLevel ++;//trolls are less stable
			player.decideHemoCaste(player);
			player.decideLusus(player);
			player.kernel_sprite = player.lusus;
		}
	}


	this.getSessionType = function(){
		if(this.sessionType > .6){
			return "Human"
		}else if(this.sessionType > .3){
			return "Troll"
		}
		return "Mixed"
	}


	this.newScene = function(){
		this.currentSceneNum ++;
		var div = "<div id='scene"+this.currentSceneNum+"'></div>";
		$("#story").append(div);
		return $("#scene"+this.currentSceneNum);
	}

	//holy shit, grand sessions are a thing? how far does this crazy train go?
	//i haven't dusted off RECURSION in forever.
	this.getLineage = function(){
			if(this.parentSession){
					return this.parentSession.getLineage().concat([this]);
			}
			return [this];
	}

	this.generateSummary = function(){
		var summary = new SessionSummary();
		summary.session_id = this.session_id;
		summary.num_scenes = this.scenesTriggered.length;
		summary.players = this.players;
		summary.mvp = findStrongestPlayer(this.players);
		summary.parentSession = this.parentSession;
		summary.scratchAvailable = this.scratchAvailable;
		summary.yellowYard = findSceneNamed(this.scenesTriggered,"YellowYard") != "No"
		summary.numLiving =  findLivingPlayers(this.players).length;
		summary.numDead =  findDeadPlayers(this.players).length;
		summary.ectoBiologyStarted = this.ectoBiologyStarted;
		summary.denizenFought = findSceneNamed(this.scenesTriggered,"FaceDenizen") != "No";
		summary.plannedToExileJack = findSceneNamed(this.scenesTriggered,"PlanToExileJack") != "No";
		summary.exiledJack = findSceneNamed(this.scenesTriggered,"ExileJack") != "No"
		summary.exiledQueen = findSceneNamed(this.scenesTriggered,"ExileQueen") != "No"
		summary.jackPromoted = findSceneNamed(this.scenesTriggered,"JackPromotion") != "No"
		summary.jackGotWeapon = findSceneNamed(this.scenesTriggered,"GiveJackBullshitWeapon") != "No"
		summary.jackRampage = findSceneNamed(this.scenesTriggered,"JackRampage") != "No"
		summary.jackScheme = findSceneNamed(this.scenesTriggered,"JackBeginScheming") != "No"
		summary.kingTooPowerful =findSceneNamed(this.scenesTriggered,"KingPowerful") != "No"
		summary.queenRejectRing =findSceneNamed(this.scenesTriggered,"QueenRejectRing") != "No"
		summary.democracyStarted =findSceneNamed(this.scenesTriggered,"StartDemocracy") != "No"
		summary.murderMode = findSceneNamed(this.scenesTriggered,"EngageMurderMode") != "No"
		summary.grimDark = findSceneNamed(this.scenesTriggered,"GoGrimDark") != "No"
		var spacePlayer = findAspectPlayer(this.players, "Space");
		summary.frogLevel =spacePlayer.landLevel
		summary.hasDiamonds =this.hasDiamonds;
		summary.hasSpades = this.hasSpades;
		summary.hasClubs = this.hasClubs;
		summary.hasHearts =  this.hasHearts;
		return summary;
	}
}


function summarizeScene(scenesTriggered, str){
	var tmp = findSceneNamed(scenesTriggered,str)
	if(tmp != "No"){
		tmp = "Yes"
	}
	return "<br>&nbsp&nbsp&nbsp&nbsp" +str + ": " + tmp
}

function findSceneNamed(scenesToCheck, name){
	for(var i = 0; i<scenesToCheck.length; i++){
		if(scenesToCheck[i].constructor.name == name){
			return scenesToCheck[i];
		}
	}
	return "No"
}
