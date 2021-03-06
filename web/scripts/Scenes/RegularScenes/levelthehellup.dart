import "dart:html";
import "../../SBURBSim.dart";


class LevelTheHellUp extends Scene {


    LevelTheHellUp(Session session) : super(session);

    @override
    bool trigger(playerList) {
        this.playerList = playerList;
        for (num i = 0; i < playerList.length; i++) { //can happen even after death, because why not?
            var p = playerList[i];
            if (p.leveledTheHellUp && p.level_index < (p.mylevels.length - 1)) { //don't level up if max level (-2 cuz this will increase level by 1)'
                return true;
            }
        }
        return false;
    }

    //TODO if i evenually do something with boonies, can have fraymotifs locked to this.
    dynamic getBoonies(p) {
        var num = (p.getStat(Stats.POWER)).round() * 15;
        String denomination = " BOONDOLLARS";
        if (num > 1000000) {
            num = (num / 1000000).floor();
            denomination = " BOONMINTS";
        } else if (num > 100000) {
            num = (num / 100000).floor();
            denomination = " BOONBANKS";
        }
        else if (num > 10000) {
            num = (num / 10000).floor();
            denomination = " BOONBONDS";
        } else if (num > 1000) {
            num = (num / 1000).floor();
            denomination = " BOONBUCKS";
        }
        num += (rand.nextDouble() * 75).floor();
        return num.toString() + denomination;
    }

    void renderForPlayer(Element div, Player player) {
        String levelName = player.getNextLevel(); //could be undefined
        if (levelName == null) {
            //session.logger.info("Scratched is:  Player has AAAAAAAALL the levels. All of them. " + this.session.session_id.toString());
            return; //don't make a blank div
        }
        var boonies = this.getBoonies(player);
        String narration = "";
        var divID = (div.id) + "_" + player.id.toString();
        Element narrationDiv = new DivElement();

        //different format for canvas code

        if (levelName != null) {
            narration += " <br>The " + player.htmlTitle();
            if(player.class_name == SBURBClassManager.WASTE) {
                narration += " keeps falling up the ECHESTAIRS to a new tread: " + levelName;
            }else {
                narration += " skyrockets up the ECHELADDER to a new rung: " + levelName;

            }
            narration += " and earns " + boonies + ". ";
        }
        appendHtml(narrationDiv, narration);
        div.append(narrationDiv);
        if (levelName != null && !player.godTier) {
            CanvasElement canvasDiv = new CanvasElement(width: canvasWidth, height: canvasHeight);
            div.append(canvasDiv);
            Drawing.drawLevelUp(canvasDiv, player);
        } else if (levelName != null && player.godTier) {
            //god tier has to be taller.
            CanvasElement canvasDiv = new CanvasElement(width: canvasWidth, height: 600);
            div.append(canvasDiv);
            Drawing.drawLevelUpGodTier(canvasDiv, player);
        }
    }

    @override
    void renderContent(Element div) {
        String narration = "";
        for (num i = 0; i < this.playerList.length; i++) {
            Player p = this.playerList[i];
            ////session.logger.info("Level index is: ${p.level_index} while my levels length is ${p.mylevels.length}");
            //it's a var so i debug this nightmare without end
            bool canLevel = p.leveledTheHellUp && ((p.level_index + 1) < p.mylevels.length);
            if (canLevel) { //can't level up if max level
                ////session.logger.info("going to level up");
                this.renderForPlayer(div, p);
                p.leveledTheHellUp = false;
            }
        }
    }


}
