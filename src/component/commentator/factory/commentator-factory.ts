import {Commentator, TCommentator} from "../commentator";
import {NameChooser, RandomInt} from "../utils";
import {CarFactory} from "./car-factory";

export class CommentatorFactory {
    create(): TCommentator {
        return new Commentator(
            NameChooser.getRand(),
            CarFactory.createRandom(),
            RandomInt.generate({max: 3})
        );
    }
}
