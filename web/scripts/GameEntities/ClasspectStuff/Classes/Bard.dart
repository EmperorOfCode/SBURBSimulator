import "../../../SBURBSim.dart";
import "SBURBClass.dart";
import "../../../Lands/FeatureTypes/QuestChainFeature.dart";
import "../../../Lands/Reward.dart";
import "../../../Lands/Quest.dart";

class Bard extends SBURBClass {

    @override
    List<String> levels = ["SKAIA'S TOP IDOL", "POPSTAR BOPPER", "SONGSCUFFER"];
    @override
    List<String> quests = ["allowing events to transpire such that various quests complete themselves", "baiting various enemies into traps for an easy victory", "watching as their manipulations result in consorts rising up to defeat imps"];
    @override
    List<String> postDenizenQuests = ["musing on the nature of death as they wander from desolate consort graveyard to desolate consort graveyard", "staring vacantly into the middle distance as every challenge that rises before them falls away before it even has a chance to do anything", "putting on a performance for a huge crowd of awestruck consorts and underlings", "playing pranks and generally messing around with the most powerful enemies left in the game"];
    @override
    List<String> handles = ["bat","benign", "blissful", "boisterous", "bonkers", "broken", "bizarre", "barking"];

    //for quests and shit
    @override
    bool isProtective = false;
    @override
    bool isSmart = false;
    @override
    bool isSneaky = false;
    @override
    bool isMagical = false;
    @override
    bool isDestructive = true;
    @override
    bool isHelpful = false;

    Bard() : super("Bard", 9, true);

    @override
    num modPowerBoostByClass(num powerBoost, AssociatedStat stat) {
        if (stat.multiplier > 0) {
            powerBoost = powerBoost * -0.5; //good things invert to bad.
        } else {
            powerBoost = powerBoost * -2.0; //bad thigns invert to good, with a boost to make up for the + to bad things
        }
        return powerBoost;
    }

    @override
    bool hasInteractionEffect() {
        return true;
    }

    @override
    String interactionFlavorText(Player me, GameEntity target, Random rand) {
        return " The ${me.htmlTitle()} appears to be destroying ${rand.pickFrom(me.aspect.symbolicMcguffins)} in everyone. ";
    }

    @override
    void processStatInteractionEffect(Player p, GameEntity target, AssociatedStat stat) {
        num powerBoost = p.getPowerForEffects() / 20;
        powerBoost = this.modPowerBoostByClass(powerBoost, stat);
        //modify others
        if(p.session.mutator.bloodField) powerBoost = powerBoost * p.session.mutator.bloodBoost;
        target.modifyAssociatedStat(powerBoost, stat);
    }

    @override
    double getAttackerModifier() {
        return 2.0;
    }

    @override
    double getDefenderModifier() {
        return 0.5;
    }

    @override
    double getMurderousModifier() {
        return 3.0;
    }

    @override
    void initializeThemes() {
        /*
        new Quest(" "),
        new Quest(""),
        new Quest(" ")

        */
        addTheme(new Theme(<String>["Festivals","Carnivals", "Parades", "Celebrations","Jamboree","Fairs","Amusements"])
            ..addFeature(FeatureFactory.CLAPPINGSOUND, Feature.HIGH)
            ..addFeature(FeatureFactory.SPICYSMELL, Feature.HIGH)
            ..addFeature(FeatureFactory.SWEETSMELL, Feature.HIGH)
            ..addFeature(FeatureFactory.HAPPYFEELING, Feature.HIGH)
            ..addFeature(FeatureFactory.MUSICSOUND, Feature.HIGH)
            ..addFeature(FeatureFactory.BAKEDBREADSMELL, Feature.HIGH)
            ..addFeature(new PostDenizenQuestChain("Celebrate the Win", [
                new Quest("After all the bullshit the ${Quest.DENIZEN} has put the native ${Quest.CONSORT}s through, the ${Quest.PLAYER1} figures they could use a break. They decide to revive a planet wide ${Quest.MCGUFFIN} Festival to get morale back up."),
                new Quest("A small ${Quest.CONSORT} is sobbing and ${Quest.CONSORTSOUND}ing after losing a carnival game. The ${Quest.PLAYER1} decides that this is not a day of losses, and begins rigging the games to have a higher pay out rate than normal. Soon the land is filled with the sound of happy ${Quest.CONSORTSOUND}s."),
                new Quest(" The ${Quest.CONSORT}s who were running the carnival games are now bankrupt. Their wailing and ${Quest.CONSORTSOUND}ing fills the air. Fuck.  Who knew actions have consequences? The ${Quest.PLAYER1} arranges 'anonymous' donations to them and decides that maybe they should just quit while they are ahead. ")
            ], new Reward(), QuestChainFeature.defaultOption), Feature.WAY_LOW)

            //space player near guaranteed to do this.
            ..addFeature(new PostDenizenQuestChain("Pull the Strings of a Universe", [
                new Quest("The ${Quest.PLAYER1} organizes a huge festival for all the ${Quest.CONSORT}s themed around finding and collecting frogs. They sit back and allow events to transpire. "),
                new Quest("The ${Quest.PLAYER1} presides over a festival competition where ${Quest.CONSORT} contestants try to breed the best frogs."),
                new Quest("The ${Quest.PLAYER1} sets things up such that the final frog was always going to be right where it needed to be.   The Ultimate Tadpole is ready.  All they need to do is keep it in their Sylladex until the battlefield is fertilized.  "),
            ], new FrogReward(), QuestChainFeature.spacePlayer), Feature.WAY_HIGH)
            ,  Theme.MEDIUM);
    }


}