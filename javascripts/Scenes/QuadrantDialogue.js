function KingPowerful(session){
	this.session=session;
	this.canRepeat = true;
	this.player1 = null;
	this.player2 = null;

	//this should have a higher priority than land quests, 'cause the point is relationships distract you from playing the damn game.
	this.trigger = function(){
		this.player1 = null;
		this.player2 = null;
		/*
			two ways I can do this:
			Either I can select a player at random, and if they are in a quadrant, return true.
			OR, pass a random number test, then  filter players down to only those who are in a quadrant, and return true.
			
			First one is probably easiest, but hardest to modify rate of triggering.
			Stop picking the laziest way to do things, dunkass.
		*/
		if(Math.seededRandom() > 0.0001){ //fiddle with rate later, for now, i want to see this happen.
			findSemiRandomQuadrantedAvailablePlayer();
			findQuardrantMate();
		}
		return false;
	}
	
	this.findSemiRandomQuadrantedAvailablePlayer(){
		//set this.player1 to be a random quadranted player.
		//BUT, if there is a player in a moiralligence who is on the verge of flipping their shit, return them.  so not completely random.
	}
	
	this.findQuardrantMate(){
		//set this.player2 to be one of player1's quadrant mates. first diamond, then heart, then spade, then clubs.
	}
	
	this.getDiscussSymbol(){
		//TODO, turn which quadrant player1 and player2 are in into a png to pass.  Create pngs for diamonds and clubs.
	}
	
	this.getQuadrant = function(){
		var r = this.player1.getRelationshipWith(this.player2);
		return r;
	}
	
	this.chatAboutInterests = function(trait,relationship){
		//calls different methods depending on trait, THOSE methods determine what they randomly talk about (based on relationship value)
		//trolls talking about pop culture should just list out a huge movie title because i am trash.
		//maybe randomly generate the movie title because holy fuck does that sound amazing.
	}
	
	this.chatAboutQuadrant = function(relationship){
		//calls different methods based on quadrant.  THOSE methods have different shit in them based on value (foreshadows break up.)
	}
	
	this.feelingsJam = function(relationship){
		console.log("Feelings Jam in: " + this.session.session_id)
		//figure out which player is flipping out, make them "flippingOut", make other player "shoosher"
		//have them talk about flipOUtREason.  flippingOut has triggerLevel reduced by a good amount.
	}
	
	this.getChat =function(){
		var relationship = this.getQuadrant();
		//feelings jams have highest priority.
		if(relationship.saved_type == relationship.diamond && (this.player1.flipOutReason || this.player2.flipOutReason)){
			return this.feelingsJam(relationship);
		}
		var trait = whatDoPlayersHaveInCommon(this.player1, this.player2);
		if(trait != "nice"){
			if(Math.seededRandom() > 0.5){
				return this.chatAboutInterests(trait,relationship); //more likely to talk about interests.
			}else{
				return this.chatAboutQuadrant(relationship);
			}
		}else{  //no option to chat about interests.
			return this.chatAboutQuadrant(relationship);
		}
	}
	
	this.chat = function(div){
		var canvasHTML = "<br><canvas id='canvas" + (div.attr("id")) +"' width='" +canvasWidth + "' height="+canvasHeight + "'>  </canvas>";
		div.append(canvasHTML);
		var chatText = this.getChat();
		drawChat(document.getElementById("canvas"+ (div.attr("id"))), this.player1, this.player2, chatText, repeatTime,this.getDiscussSymbol());
	}

	this.renderContent = function(div){
		if(this.player1.aspect != "Time") removeFromArray(this.player1, this.session.availablePlayers);
		if(this.player2.aspect != "Time") removeFromArray(this.player2, this.session.availablePlayers);
		
		/*
				Since this dialogue has no "purpose", no information that HAS to be conveyed, can treat it as more dynamic.
				Go for bullshit elder scrolls pairs. 
				
				Greeting (based on quadrant, not generic greetings)
				Greeting
				
				chatPair1, chatPair2, chatPair3
				
				where chatPair is a call and response about one of several topics, each of which have multiple random call/response things it can deploy
				
				Have you heard about Kvatch?
				No.
				
				I have been to the Imperial City recently.
				I've heard others say the same.
				
				I have nothing more to say to you.
				Good day.
				
				<3<3<3 elder scrolls. They are such ASSHOLES to each other.
				
				Chat pairs can be generated from: interests in common, quadrants
				ALSO, flipOutReason is special case. highest priority.
				
				
		*/
		this.chat(div);
		
	}

	this.content = function(){
		return "NEVER RUN IN 1.0 YOU DUNKASS."
	}


}
