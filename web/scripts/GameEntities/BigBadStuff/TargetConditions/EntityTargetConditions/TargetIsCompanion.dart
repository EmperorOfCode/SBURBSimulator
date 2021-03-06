import "../../../../SBURBSim.dart";
import 'dart:html';

//has no sub form, just exists
class TargetIsCompanion extends TargetConditionLiving {
    @override
    String name = "IsCompanion";

    Item crown;

    @override
    String get importantWord => "N/A";

    @override
    String descText = "<b>Is Companion:</b><br>Target Entity must have a Party Leader they will help out with in fights (when they are not doing their own thing). <br><br>";
    @override
    String notDescText = "<b>Is NOT Companions:</b><br>Target Entity must be NOT have a Party Leader. <br><br>";

    //strongly encouraged for this to be replaced
    //like, "An ominous 'honk' makes the Knight of Rage drop the Juggalo Poster in shock. With growing dread they realize that shit is about to get hella rowdy, as the Mirthful Messiahs have rolled into town.

    TargetIsCompanion(SerializableScene scene) : super(scene){
    }




    @override
    TargetCondition makeNewOfSameType() {
        return new TargetIsCompanion(scene);
    }

    @override
    void syncFormToMe() {
        syncFormToNotFlag();
    }

    @override
    void syncToForm() {
        syncNotFlagToForm();
        scene.syncForm();
    }
    @override
    void copyFromJSON(JSONObject json) {
        //nothing to do
    }

    @override
    bool conditionForFilter(GameEntity item) {
        return item.partyLeader != null;
    }
}