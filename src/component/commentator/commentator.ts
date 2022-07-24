import { Hello, TimeInfo, SymbolInfo, GameOver, Anything, Joke, Story, Fact } from './utils';
import { CommentatorAction} from "../../constants/enums/commentator-action";

// Factory pattern
export class Commentator {
    say(type, arg?: any) {
        let comment;
        switch(type) {
            case CommentatorAction.HELLO:
                comment = new Hello().sayAboutMe(arg);
                break;
            case CommentatorAction.BEFORE_GAME:
                comment = new Hello().sayAboutUsers(arg);
                break;
            case CommentatorAction.EVERY_30_SEC:
                comment = new TimeInfo().everyone(arg);
                break;
            case CommentatorAction.SYMBOL_30_TO_FINISH:
                comment = new SymbolInfo().get(arg);
                break;
            case CommentatorAction.USER_ON_FINISH:
                comment =  new GameOver().one(arg);
                break;
            case CommentatorAction.GAME_OVER:
                comment = new GameOver().everyone(arg);
                break;
            case CommentatorAction.ANYTHING:
                const anything = new Anything(new Joke(), new Story(), new Fact());
                comment = anything.say();
                break;
            default:
                comment = 'Кхм кхм, что-то я приболел';
        }
        return comment;
    }
}

export type TCommentator = InstanceType<typeof Commentator>;